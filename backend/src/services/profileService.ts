import { userRepository } from "../repositories/userRepository.js";
import { tutorProfileRepository } from "../repositories/tutorProfileRepository.js";
import { studentProfileRepository } from "../repositories/studentProfileRepository.js";
import { uploadService } from "./uploadService.js";
import { NotFoundError } from "../utils/errors.js";
import type { IUser } from "../models/User.js";
import type { ITutorProfile } from "../models/TutorProfile.js";
import type { IStudentProfile } from "../models/StudentProfile.js";

export interface TutorProfileUpdate {
  bio?: string;
  subjects?: string[];
  levels?: string[];
  tutoringType?: "online" | "home" | "both";
  teachingModes?: string[];
  availability?: { online: any[]; home: any[] };
  homeTuitionCities?: string[];
  hourlyRate?: number;
  experience?: number;
  qualification?: string;
}

export interface StudentProfileUpdate {
  classLevel?: string;
  institution?: string;
}

export interface UserUpdate {
  name?: string;
  phone?: string;
  city?: string;
  cnic?: string;
}

function checkTutorProfileComplete(profile: ITutorProfile): boolean {
  return !!(
    profile.bio &&
    profile.subjects.length > 0 &&
    profile.levels.length > 0 &&
    profile.hourlyRate &&
    profile.qualification
  );
}

function checkStudentProfileComplete(profile: IStudentProfile): boolean {
  return !!(profile.classLevel && profile.institution);
}

export const profileService = {
  async getFullProfile(userId: string, role: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    if (role === "tutor") {
      const profile = await tutorProfileRepository.findByUserId(userId);
      return { user, profile };
    }
    if (role === "student") {
      const profile = await studentProfileRepository.findByUserId(userId);
      return { user, profile };
    }
    return { user, profile: null };
  },

  async updateUserFields(userId: string, data: UserUpdate): Promise<IUser> {
    const user = await userRepository.updateById(userId, data);
    if (!user) throw new NotFoundError("User not found");
    return user;
  },

  async updateTutorProfile(
    userId: string,
    userUpdate: UserUpdate,
    profileUpdate: TutorProfileUpdate,
  ): Promise<{ user: IUser; profile: ITutorProfile }> {
    const [user, profile] = await Promise.all([
      userRepository.updateById(userId, userUpdate),
      tutorProfileRepository.upsertByUserId(userId, profileUpdate),
    ]);
    if (!user) throw new NotFoundError("User not found");

    const isComplete = checkTutorProfileComplete(profile);
    if (isComplete !== profile.isProfileComplete) {
      await tutorProfileRepository.updateByUserId(userId, {
        isProfileComplete: isComplete,
      });
      profile.isProfileComplete = isComplete;
    }

    return { user, profile };
  },

  async updateStudentProfile(
    userId: string,
    userUpdate: UserUpdate,
    profileUpdate: StudentProfileUpdate,
  ): Promise<{ user: IUser; profile: IStudentProfile }> {
    const [user, profile] = await Promise.all([
      userRepository.updateById(userId, userUpdate),
      studentProfileRepository.upsertByUserId(userId, profileUpdate),
    ]);
    if (!user) throw new NotFoundError("User not found");

    const isComplete = checkStudentProfileComplete(profile);
    if (isComplete !== profile.isProfileComplete) {
      await studentProfileRepository.updateByUserId(userId, {
        isProfileComplete: isComplete,
      });
      profile.isProfileComplete = isComplete;
    }

    return { user, profile };
  },

  async uploadAvatar(userId: string, fileBuffer: Buffer): Promise<string> {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    if (user.avatarPublicId) {
      uploadService.deleteFile(user.avatarPublicId).catch(() => {});
    }

    const { url, publicId } = await uploadService.uploadAvatar(
      fileBuffer,
      userId,
    );
    await userRepository.updateById(userId, {
      avatarUrl: url,
      avatarPublicId: publicId,
    });
    return url;
  },

  async uploadTutorDocument(
    userId: string,
    docType: string,
    fileBuffer: Buffer,
  ): Promise<{ url: string; publicId: string }> {
    const { url, publicId } = await uploadService.uploadDocument(
      fileBuffer,
      userId,
      docType,
    );

    const profile = await tutorProfileRepository.findByUserId(userId);
    if (!profile) throw new NotFoundError("Tutor profile not found");

    const existingIdx = profile.documents.findIndex(
      (d) => d.docType === docType,
    );
    if (existingIdx >= 0) {
      uploadService
        .deleteFile(profile.documents[existingIdx].publicId)
        .catch(() => {});
      profile.documents[existingIdx] = {
        docType: docType as ITutorProfile["documents"][0]["docType"],
        url,
        publicId,
        uploadedAt: new Date(),
      };
    } else {
      profile.documents.push({
        docType: docType as ITutorProfile["documents"][0]["docType"],
        url,
        publicId,
        uploadedAt: new Date(),
      });
    }

    await tutorProfileRepository.updateByUserId(userId, {
      documents: profile.documents,
    });
    return { url, publicId };
  },

  async uploadStudentDocument(
    userId: string,
    docType: string,
    fileBuffer: Buffer,
  ): Promise<{ url: string; publicId: string }> {
    const { url, publicId } = await uploadService.uploadDocument(
      fileBuffer,
      userId,
      docType,
    );

    const profile = await studentProfileRepository.findByUserId(userId);
    if (!profile) throw new NotFoundError("Student profile not found");

    const existingIdx = profile.documents.findIndex(
      (d) => d.docType === docType,
    );
    if (existingIdx >= 0) {
      uploadService
        .deleteFile(profile.documents[existingIdx].publicId)
        .catch(() => {});
      profile.documents[existingIdx] = {
        docType: docType as IStudentProfile["documents"][0]["docType"],
        url,
        publicId,
        uploadedAt: new Date(),
      };
    } else {
      profile.documents.push({
        docType: docType as IStudentProfile["documents"][0]["docType"],
        url,
        publicId,
        uploadedAt: new Date(),
      });
    }

    await studentProfileRepository.updateByUserId(userId, {
      documents: profile.documents,
    });
    return { url, publicId };
  },
};
