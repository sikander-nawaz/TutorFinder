import type { Request, Response, NextFunction } from "express";
import { requestRepository } from "../repositories/requestRepository.js";
import { userRepository } from "../repositories/userRepository.js";
import { TutorProfile } from "../models/TutorProfile.js";
import { Course } from "../models/Course.js";
import { sendSuccess } from "../utils/response.js";
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from "../utils/errors.js";

export const requestController = {
  async getStudentRequests(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.userId) throw new BadRequestError("User ID required");
      const requests = await requestRepository.findByStudentId(req.userId);
      sendSuccess({ res, data: { requests } });
    } catch (err) {
      next(err);
    }
  },

  async getTutorRequests(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.userId) throw new BadRequestError("User ID required");
      const requests = await requestRepository.findByTutorId(req.userId);
      sendSuccess({ res, data: { requests } });
    } catch (err) {
      next(err);
    }
  },

  async getAllRequests(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // Admin only - should add admin middleware check
      const requests = await requestRepository.findAll();
      sendSuccess({ res, data: { requests } });
    } catch (err) {
      next(err);
    }
  },

  async createRequest(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.userId || !req.userRole)
        throw new BadRequestError("User info required");
      if (req.userRole !== "student")
        throw new ForbiddenError("Only students can create requests");

      const {
        tutorId,
        courseId,
        subject,
        level,
        mode,
        message,
        fee,
        selectedSlot,
        homeAddress,
      } = req.body;

      if (
        !tutorId ||
        !subject ||
        !level ||
        !mode ||
        !message ||
        fee === undefined
      ) {
        throw new BadRequestError("Required fields missing");
      }
      if (
        !selectedSlot ||
        !selectedSlot.day ||
        !selectedSlot.startTime ||
        !selectedSlot.endTime
      ) {
        throw new BadRequestError("A time slot must be selected");
      }
      if (mode !== "online" && mode !== "home") {
        throw new BadRequestError("Mode must be 'online' or 'home'");
      }

      // Validate slot against course availability (if courseId provided) or profile availability
      if (courseId) {
        const course = await Course.findById(courseId as string).lean();
        if (!course) throw new NotFoundError("Course not found");
        if (course.tutorId.toString() !== (tutorId as string))
          throw new BadRequestError("Course does not belong to this tutor");

        const courseModeOk = course.mode === mode || course.mode === "both";
        if (!courseModeOk)
          throw new BadRequestError(
            `This course does not support ${mode} sessions`,
          );

        const courseSlots = (course.availability?.[mode as "online" | "home"] ||
          []) as Array<{
          day: string;
          startTime: string;
          endTime: string;
        }>;
        const slotMatch = courseSlots.some(
          (s) =>
            s.day === selectedSlot.day &&
            s.startTime === selectedSlot.startTime &&
            s.endTime === selectedSlot.endTime,
        );
        if (!slotMatch)
          throw new BadRequestError(
            "Selected slot is not available for this course",
          );
      } else {
        // Fallback: validate against tutor profile-level availability
        const tutorProfile = await TutorProfile.findOne({
          userId: tutorId,
        }).lean();
        if (!tutorProfile) throw new NotFoundError("Tutor profile not found");
        if (
          !tutorProfile.teachingModes ||
          !tutorProfile.teachingModes.includes(mode)
        )
          throw new BadRequestError(
            `This tutor does not offer ${mode} sessions`,
          );

        const modeSlots = (tutorProfile.availability?.[
          mode as "online" | "home"
        ] || []) as Array<{
          day: string;
          startTime: string;
          endTime: string;
        }>;
        const slotMatch = modeSlots.some(
          (s) =>
            s.day === selectedSlot.day &&
            s.startTime === selectedSlot.startTime &&
            s.endTime === selectedSlot.endTime,
        );
        if (!slotMatch)
          throw new BadRequestError(
            "Selected slot is not in tutor's availability",
          );
      }

      if (mode === "home") {
        if (!homeAddress?.city || !homeAddress?.fullAddress) {
          throw new BadRequestError(
            "Home address (city and full address) is required for home sessions",
          );
        }
        const tutorProfile = await TutorProfile.findOne({
          userId: tutorId,
        }).lean();
        const cities: string[] = tutorProfile?.homeTuitionCities || [];
        if (
          cities.length > 0 &&
          !cities
            .map((c) => c.toLowerCase())
            .includes(homeAddress.city.toLowerCase())
        ) {
          throw new BadRequestError(
            `Tutor does not offer home tuition in ${homeAddress.city}`,
          );
        }
      }

      const [student, tutor] = await Promise.all([
        userRepository.findById(req.userId),
        userRepository.findById(tutorId as string),
      ]);
      if (!student) throw new NotFoundError("Student not found");
      if (!tutor) throw new NotFoundError("Tutor not found");

      const request = await requestRepository.create({
        studentId: req.userId,
        tutorId: tutorId as string,
        ...(courseId ? { courseId: courseId as string } : {}),
        studentName: student.name,
        tutorName: tutor.name,
        tutorAvatarUrl: tutor.avatarUrl,
        subject: subject as string,
        level: level as string,
        mode: mode as "online" | "home",
        selectedSlot,
        ...(mode === "home" && homeAddress ? { homeAddress } : {}),
        message: message as string,
        fee: Number(fee),
      });

      sendSuccess({
        res,
        statusCode: 201,
        message: "Request created",
        data: { request },
      });
    } catch (err) {
      next(err);
    }
  },

  async updateRequest(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.userId) throw new BadRequestError("User ID required");
      const { id } = req.params;
      const { subject, level, mode, message, fee, scheduledAt } = req.body;

      const existingRequest = await requestRepository.findById(id as string);
      if (!existingRequest) throw new NotFoundError("Request not found");

      // Only student who created it can update
      if (existingRequest.studentId.toString() !== req.userId) {
        throw new ForbiddenError("Not authorized to update this request");
      }

      // Can't update if not pending
      if (existingRequest.status !== "pending") {
        throw new BadRequestError(
          "Cannot update request that is no longer pending",
        );
      }

      const updated = await requestRepository.update(id as string, {
        ...(subject && { subject: subject as string }),
        ...(level && { level: level as string }),
        ...(mode && { mode: mode as "online" | "home" }),
        ...(message && { message: message as string }),
        ...(fee !== undefined && { fee: Number(fee) }),
        ...(scheduledAt && { scheduledAt: new Date(scheduledAt as string) }),
      });

      sendSuccess({
        res,
        message: "Request updated",
        data: { request: updated },
      });
    } catch (err) {
      next(err);
    }
  },

  async updateRequestStatus(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.userId) throw new BadRequestError("User ID required");
      const { id } = req.params;
      const { status } = req.body as {
        status: "pending" | "approved" | "rejected" | "trial" | "completed";
      };

      if (
        !status ||
        !["pending", "approved", "rejected", "trial", "completed"].includes(
          status,
        )
      ) {
        throw new BadRequestError("Valid status required");
      }

      const existingRequest = await requestRepository.findById(id as string);
      if (!existingRequest) throw new NotFoundError("Request not found");

      // Only the tutor can update status
      if (existingRequest.tutorId.toString() !== req.userId) {
        throw new ForbiddenError("Only the tutor can update request status");
      }

      const updateData: Record<string, any> = { status };

      // CORE RULE: When tutor approves → require meetingLink for online; auto-reject other pending requests
      if (status === "approved") {
        if (existingRequest.mode === "online") {
          const { meetingLink } = req.body as { meetingLink?: string };
          if (!meetingLink || !meetingLink.trim()) {
            throw new BadRequestError(
              "A meeting link is required to accept online session requests",
            );
          }
          updateData.meetingLink = meetingLink.trim();
        }
        const trialStartedAt = new Date();
        updateData.trialStartedAt = trialStartedAt;
        updateData.trialExpiresAt = new Date(
          trialStartedAt.getTime() + 48 * 60 * 60 * 1000,
        );

        // Auto-reject all other pending requests from this student
        const { TutorRequest } = await import("../models/TutorRequest.js");
        await TutorRequest.updateMany(
          {
            studentId: existingRequest.studentId,
            _id: { $ne: existingRequest._id },
            status: "pending",
          },
          { $set: { status: "rejected" } },
        );
      }

      if (status === "trial") {
        const trialStartedAt = new Date();
        updateData.trialStartedAt = trialStartedAt;
        updateData.trialExpiresAt = new Date(
          trialStartedAt.getTime() + 48 * 60 * 60 * 1000,
        );
      }

      const updated = await requestRepository.update(id as string, updateData);
      sendSuccess({
        res,
        message: "Status updated",
        data: { request: updated },
      });
    } catch (err) {
      next(err);
    }
  },

  async deleteRequest(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.userId) throw new BadRequestError("User ID required");
      const { id } = req.params;

      const existingRequest = await requestRepository.findById(id as string);
      if (!existingRequest) throw new NotFoundError("Request not found");

      // Only student who created it can delete
      if (existingRequest.studentId.toString() !== req.userId) {
        throw new ForbiddenError("Not authorized to delete this request");
      }

      await requestRepository.delete(id as string);
      sendSuccess({ res, message: "Request deleted" });
    } catch (err) {
      next(err);
    }
  },
};
