import type { Request, Response, NextFunction } from "express";
import { reviewRepository } from "../repositories/reviewRepository.js";
import { requestRepository } from "../repositories/requestRepository.js";
import { userRepository } from "../repositories/userRepository.js";
import { sendSuccess } from "../utils/response.js";
import { BadRequestError, NotFoundError, ForbiddenError, ConflictError } from "../utils/errors.js";

export const reviewController = {
  async getTutorReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tutorId } = req.params;
      const reviews = await reviewRepository.findByTutorId(tutorId as string);
      sendSuccess({ res, data: { reviews } });
    } catch (err) {
      next(err);
    }
  },

  async createReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId || !req.userRole) throw new BadRequestError("User info required");
      if (req.userRole !== "student") throw new ForbiddenError("Only students can leave reviews");

      const { requestId, rating, comment } = req.body as {
        requestId: string;
        rating: number;
        comment?: string;
      };

      if (!requestId || !rating) throw new BadRequestError("requestId and rating are required");
      if (rating < 1 || rating > 5) throw new BadRequestError("Rating must be between 1 and 5");

      // Verify the request exists and belongs to this student
      const tutorRequest = await requestRepository.findById(requestId);
      if (!tutorRequest) throw new NotFoundError("Request not found");
      if (tutorRequest.studentId.toString() !== req.userId) {
        throw new ForbiddenError("Not authorized to review this request");
      }
      if (tutorRequest.status !== "completed") {
        throw new BadRequestError("Can only review completed sessions");
      }

      // Check for duplicate review
      const exists = await reviewRepository.existsByRequestId(requestId);
      if (exists) throw new ConflictError("You have already reviewed this session");

      const student = await userRepository.findById(req.userId);
      if (!student) throw new NotFoundError("Student not found");

      const review = await reviewRepository.create({
        tutorId: tutorRequest.tutorId.toString(),
        studentId: req.userId,
        requestId,
        studentName: student.name,
        studentAvatar: student.avatarUrl,
        rating: Number(rating),
        comment,
      });

      sendSuccess({ res, statusCode: 201, message: "Review submitted", data: { review } });
    } catch (err) {
      next(err);
    }
  },
};
