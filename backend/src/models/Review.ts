import mongoose, { Document, Schema, Types } from "mongoose";

export interface IReview extends Document {
  _id: Types.ObjectId;
  tutorId: Types.ObjectId;
  studentId: Types.ObjectId;
  requestId: Types.ObjectId;
  studentName: string;
  studentAvatar?: string;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    tutorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    requestId: { type: Schema.Types.ObjectId, ref: "TutorRequest", required: true, unique: true },
    studentName: { type: String, required: true },
    studentAvatar: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

ReviewSchema.index({ tutorId: 1, createdAt: -1 });

export const Review = mongoose.model<IReview>("Review", ReviewSchema);
