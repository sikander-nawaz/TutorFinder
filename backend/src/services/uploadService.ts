import { cloudinary } from "../config/cloudinary.js";
import { logger } from "../lib/logger.js";
import { AppError } from "../utils/errors.js";
import type { UploadApiResponse } from "cloudinary";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

interface UploadResult {
  url: string;
  publicId: string;
}

function isCloudinaryConfigured(): boolean {
  const name = process.env["CLOUDINARY_CLOUD_NAME"] || "";
  return !!name && !name.startsWith("your_") && name !== "your_cloud_name";
}

function saveLocally(
  fileBuffer: Buffer,
  subDir: string,
  filename: string,
): UploadResult {
  const uploadsRoot = join(process.cwd(), "public", "uploads", subDir);
  mkdirSync(uploadsRoot, { recursive: true });
  const filePath = join(uploadsRoot, filename);
  writeFileSync(filePath, fileBuffer);
  const port = process.env["PORT"] || "8080";
  return {
    url: `http://localhost:${port}/uploads/${subDir}/${filename}`,
    publicId: `local:${subDir}/${filename}`,
  };
}

export const uploadService = {
  async uploadAvatar(
    fileBuffer: Buffer,
    userId: string,
  ): Promise<UploadResult> {
    if (!isCloudinaryConfigured()) {
      logger.warn("Cloudinary not configured — saving avatar to local disk");
      return saveLocally(fileBuffer, "avatars", `user_${userId}.jpg`);
    }
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `tutor-finder/avatars`,
          public_id: `user_${userId}`,
          overwrite: true,
          transformation: [
            { width: 400, height: 400, crop: "fill", gravity: "face" },
            { quality: "auto", fetch_format: "auto" },
          ],
        },
        (error, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            logger.error({ error }, "Cloudinary avatar upload failed");
            return reject(new AppError("Failed to upload avatar", 500));
          }
          resolve({ url: result.secure_url, publicId: result.public_id });
        },
      );
      uploadStream.end(fileBuffer);
    });
  },

  async uploadDocument(
    fileBuffer: Buffer,
    userId: string,
    docType: string,
  ): Promise<UploadResult> {
    if (!isCloudinaryConfigured()) {
      logger.warn("Cloudinary not configured — saving document to local disk");
      const filename = `${docType}_${Date.now()}.bin`;
      return saveLocally(fileBuffer, `documents/${userId}`, filename);
    }
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `tutor-finder/documents/${userId}`,
          public_id: `${docType}_${Date.now()}`,
          resource_type: "auto",
          transformation: [{ quality: "auto" }],
        },
        (error, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            logger.error({ error }, "Cloudinary document upload failed");
            return reject(new AppError("Failed to upload document", 500));
          }
          resolve({ url: result.secure_url, publicId: result.public_id });
        },
      );
      uploadStream.end(fileBuffer);
    });
  },

  async deleteFile(publicId: string): Promise<void> {
    if (publicId.startsWith("local:")) return;
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      logger.warn({ err, publicId }, "Failed to delete file from Cloudinary");
    }
  },
};
