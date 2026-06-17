import type { Request, Response, NextFunction } from "express";
import { courseRepository } from "../repositories/courseRepository.js";
import { sendSuccess } from "../utils/response.js";
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from "../utils/errors.js";

export const courseController = {
  async getMyCourses(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.userId) throw new BadRequestError("User ID required");
      const courses = await courseRepository.findByTutorId(req.userId);
      sendSuccess({ res, data: { courses } });
    } catch (err) {
      next(err);
    }
  },

  async createCourse(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.userId) throw new BadRequestError("User ID required");
      if (req.userRole !== "tutor")
        throw new ForbiddenError("Only tutors can create courses");

      const {
        title,
        subject,
        level,
        description,
        fee,
        mode,
        duration,
        availability,
      } = req.body;

      if (
        !title ||
        !subject ||
        !level ||
        !description ||
        fee === undefined ||
        !mode ||
        !duration
      ) {
        throw new BadRequestError("All fields are required");
      }

      const course = await courseRepository.create({
        tutorId: req.userId,
        title: title as string,
        subject: subject as string,
        level: level as string,
        description: description as string,
        fee: Number(fee),
        mode: mode as "online" | "home" | "both",
        duration: duration as string,
        ...(availability && { availability }),
      });

      sendSuccess({
        res,
        statusCode: 201,
        message: "Course created",
        data: { course },
      });
    } catch (err) {
      next(err);
    }
  },

  async updateCourse(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.userId) throw new BadRequestError("User ID required");
      const { id } = req.params;
      const {
        title,
        subject,
        level,
        description,
        fee,
        mode,
        duration,
        isActive,
        availability,
      } = req.body;

      const course = await courseRepository.update(id as string, req.userId, {
        ...(title && { title }),
        ...(subject && { subject }),
        ...(level && { level }),
        ...(description && { description }),
        ...(fee !== undefined && { fee: Number(fee) }),
        ...(mode && { mode }),
        ...(duration && { duration }),
        ...(isActive !== undefined && { isActive }),
        ...(availability !== undefined && { availability }),
      });

      if (!course) throw new NotFoundError("Course not found");
      sendSuccess({ res, message: "Course updated", data: { course } });
    } catch (err) {
      next(err);
    }
  },

  async deleteCourse(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.userId) throw new BadRequestError("User ID required");
      const { id } = req.params;

      const deleted = await courseRepository.delete(id as string, req.userId);
      if (!deleted) throw new NotFoundError("Course not found");

      sendSuccess({ res, message: "Course deleted" });
    } catch (err) {
      next(err);
    }
  },
};
