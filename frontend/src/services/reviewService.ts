import { api } from "./api";

export interface Review {
  id: string;
  tutorId: string;
  studentId: string;
  requestId: string;
  studentName: string;
  studentAvatar?: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

function normalizeReview(r: any): Review {
  return { ...r, id: (r._id || r.id)?.toString() };
}

export const reviewService = {
  async getTutorReviews(tutorId: string): Promise<Review[]> {
    const { data } = await api.get(`/tutors/${tutorId}/reviews`);
    return (data.data?.reviews || []).map(normalizeReview);
  },

  async createReview(payload: {
    requestId: string;
    rating: number;
    comment?: string;
  }): Promise<Review> {
    const { data } = await api.post("/reviews", payload);
    return data.data?.review
      ? normalizeReview(data.data.review)
      : data.data?.review;
  },
};
