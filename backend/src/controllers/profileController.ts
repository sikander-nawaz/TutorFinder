import type { Request, Response, NextFunction } from "express";
import { profileService } from "../services/profileService.js";
import { authService } from "../services/authService.js";
import { sendSuccess } from "../utils/response.js";
import { BadRequestError, ForbiddenError } from "../utils/errors.js";

const TUTOR_DOC_TYPES = [
  "cnic_front",
  "cnic_back",
  "degree",
  "experience_letter",
];
const STUDENT_DOC_TYPES = [
  "cnic_front",
  "cnic_back",
  "domicile",
  "student_card",
];

export const profileController = {
  async getProfile(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { user, profile } = await profileService.getFullProfile(
        req.userId!,
        req.userRole!,
      );
      sendSuccess({
        res,
        data: { user: authService.serializeUser(user), profile },
      });
    } catch (err) {
      next(err);
    }
  },

  async updateProfile(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const {
        name,
        phone,
        city,
        cnic,
        bio,
        subjects,
        levels,
        tutoringType,
        teachingModes,
        availability,
        homeTuitionCities,
        hourlyRate,
        experience,
        qualification,
        classLevel,
        institution,
      } = req.body as Record<string, unknown>;

      const userUpdate = {
        ...(name && { name: name as string }),
        ...(phone && { phone: phone as string }),
        ...(city && { city: city as string }),
        ...(cnic && { cnic: cnic as string }),
      };

      if (req.userRole === "tutor") {
        const modes = teachingModes as string[] | undefined;
        const derivedType =
          modes && modes.length === 2
            ? "both"
            : modes && modes[0] === "home"
              ? "home"
              : "online";

        const profileUpdate = {
          ...(bio !== undefined && { bio: bio as string }),
          ...(subjects && { subjects: subjects as string[] }),
          ...(levels && { levels: levels as string[] }),
          ...(tutoringType && {
            tutoringType: tutoringType as "online" | "home" | "both",
          }),
          ...(modes && {
            teachingModes: modes,
            tutoringType: derivedType as "online" | "home" | "both",
          }),
          ...(availability !== undefined && { availability }),
          ...(homeTuitionCities && {
            homeTuitionCities: homeTuitionCities as string[],
          }),
          ...(hourlyRate !== undefined && { hourlyRate: Number(hourlyRate) }),
          ...(experience !== undefined && { experience: Number(experience) }),
          ...(qualification && { qualification: qualification as string }),
        };
        const { user, profile } = await profileService.updateTutorProfile(
          req.userId!,
          userUpdate,
          profileUpdate,
        );
        sendSuccess({
          res,
          message: "Profile updated",
          data: { user: authService.serializeUser(user), profile },
        });
      } else if (req.userRole === "student") {
        const profileUpdate = {
          ...(classLevel && { classLevel: classLevel as string }),
          ...(institution && { institution: institution as string }),
        };
        const { user, profile } = await profileService.updateStudentProfile(
          req.userId!,
          userUpdate,
          profileUpdate,
        );
        sendSuccess({
          res,
          message: "Profile updated",
          data: { user: authService.serializeUser(user), profile },
        });
      } else {
        const user = await profileService.updateUserFields(
          req.userId!,
          userUpdate,
        );
        sendSuccess({
          res,
          message: "Profile updated",
          data: { user: authService.serializeUser(user) },
        });
      }
    } catch (err) {
      next(err);
    }
  },

  async uploadAvatar(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.file) throw new BadRequestError("No file uploaded");
      const avatarUrl = await profileService.uploadAvatar(
        req.userId!,
        req.file.buffer,
      );
      sendSuccess({ res, message: "Avatar uploaded", data: { avatarUrl } });
    } catch (err) {
      next(err);
    }
  },

  async submitVerification(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.userId) throw new BadRequestError("User ID required");
      if (req.userRole !== "tutor")
        throw new ForbiddenError("Only tutors can submit for verification");

      const { TutorProfile } = await import("../models/TutorProfile.js");
      const profile = await TutorProfile.findOne({ userId: req.userId });
      if (!profile) throw new BadRequestError("Tutor profile not found");

      const requiredTypes = ["cnic_front", "cnic_back", "degree"];
      const uploadedTypes = profile.documents.map((d) => d.docType);
      const missing = requiredTypes.filter(
        (t) => !uploadedTypes.includes(t as any),
      );
      if (missing.length > 0) {
        throw new BadRequestError(
          `Missing required documents: ${missing.join(", ")}`,
        );
      }

      const newStatus =
        profile.verificationStatus === "rejected"
          ? "reapplication"
          : "documents_submitted";
      profile.verificationStatus = newStatus;
      await profile.save();

      sendSuccess({
        res,
        message: "Verification submitted",
        data: { verificationStatus: newStatus },
      });
    } catch (err) {
      next(err);
    }
  },

  async getVerificationStatus(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.userId) throw new BadRequestError("User ID required");
      if (req.userRole !== "tutor")
        throw new ForbiddenError("Only tutors can check verification status");

      const { TutorProfile } = await import("../models/TutorProfile.js");
      const profile = await TutorProfile.findOne({ userId: req.userId });
      if (!profile) throw new BadRequestError("Tutor profile not found");

      sendSuccess({
        res,
        data: {
          verificationStatus: profile.verificationStatus,
          verificationNotes: profile.verificationNotes,
          interviewLink: profile.interviewLink,
          interviewDate: profile.interviewDate,
          rejectedAt: profile.rejectedAt,
          documents: profile.documents,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async getStudentVerificationStatus(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.userId) throw new BadRequestError("User ID required");
      if (req.userRole !== "student")
        throw new ForbiddenError("Only students can check this");

      const { StudentProfile } = await import("../models/StudentProfile.js");
      const profile = await StudentProfile.findOne({ userId: req.userId });
      if (!profile) throw new BadRequestError("Student profile not found");

      sendSuccess({
        res,
        data: {
          verificationStatus: profile.verificationStatus,
          verificationNotes: profile.verificationNotes,
          rejectedAt: profile.rejectedAt,
          isEmailVerified: profile.isEmailVerified,
          isPhoneVerified: profile.isPhoneVerified,
          documents: profile.documents,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async submitStudentVerification(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.userId) throw new BadRequestError("User ID required");
      if (req.userRole !== "student")
        throw new ForbiddenError("Only students can submit for verification");

      const { StudentProfile } = await import("../models/StudentProfile.js");
      const profile = await StudentProfile.findOne({ userId: req.userId });
      if (!profile) throw new BadRequestError("Student profile not found");

      const requiredTypes = ["cnic_front", "cnic_back", "domicile"];
      const uploadedTypes = profile.documents.map((d) => d.docType);
      const missing = requiredTypes.filter(
        (t) => !uploadedTypes.includes(t as any),
      );
      if (missing.length > 0) {
        throw new BadRequestError(
          `Missing required documents: ${missing.join(", ")}`,
        );
      }

      const newStatus =
        profile.verificationStatus === "rejected"
          ? "reapplication"
          : "pending_review";
      profile.verificationStatus = newStatus;
      await profile.save();

      sendSuccess({
        res,
        message: "Verification submitted",
        data: { verificationStatus: newStatus },
      });
    } catch (err) {
      next(err);
    }
  },

  async uploadDocument(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.file) throw new BadRequestError("No file uploaded");

      const { docType } = req.body as { docType: string };
      if (!docType) throw new BadRequestError("docType is required");

      if (req.userRole === "tutor") {
        if (!TUTOR_DOC_TYPES.includes(docType)) {
          throw new BadRequestError(
            `docType must be one of: ${TUTOR_DOC_TYPES.join(", ")}`,
          );
        }
        const result = await profileService.uploadTutorDocument(
          req.userId!,
          docType,
          req.file.buffer,
        );
        sendSuccess({ res, message: "Document uploaded", data: result });
      } else if (req.userRole === "student") {
        if (!STUDENT_DOC_TYPES.includes(docType)) {
          throw new BadRequestError(
            `docType must be one of: ${STUDENT_DOC_TYPES.join(", ")}`,
          );
        }
        const result = await profileService.uploadStudentDocument(
          req.userId!,
          docType,
          req.file.buffer,
        );
        sendSuccess({ res, message: "Document uploaded", data: result });
      } else {
        throw new ForbiddenError(
          "Only tutors and students can upload documents",
        );
      }
    } catch (err) {
      next(err);
    }
  },
};
