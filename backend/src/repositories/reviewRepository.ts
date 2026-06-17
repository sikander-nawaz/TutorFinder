import { Review, IReview } from "../models/Review.js";
import { TutorProfile } from "../models/TutorProfile.js";

export interface ReviewCreateInput {
  tutorId: string;
  studentId: string;
  requestId: string;
  studentName: string;
  studentAvatar?: string;
  rating: number;
  comment?: string;
}

export const reviewRepository = {
  async findByTutorId(tutorId: string): Promise<IReview[]> {
    return Review.find({ tutorId })
      .sort({ createdAt: -1 })
      .lean({ virtuals: true });
  },

  async findByRequestId(requestId: string): Promise<IReview | null> {
    return Review.findOne({ requestId }).lean({ virtuals: true });
  },

  async create(data: ReviewCreateInput): Promise<IReview> {
    const review = new Review(data);
    await review.save();

    // Update tutor's average rating
    const reviews = await Review.find({ tutorId: data.tutorId }).lean();
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await TutorProfile.findOneAndUpdate(
      { userId: data.tutorId },
      {
        $set: {
          averageRating: Math.round(avg * 10) / 10,
          totalReviews: reviews.length,
        },
      },
    );

    return review.toObject({ virtuals: true });
  },

  async existsByRequestId(requestId: string): Promise<boolean> {
    const count = await Review.countDocuments({ requestId });
    return count > 0;
  },
};
