import mongoose, { Document, Schema, Types } from "mongoose";

export type RequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "trial"
  | "completed";

export interface ISelectedSlot {
  day: string;
  startTime: string;
  endTime: string;
}

export interface IHomeAddress {
  city: string;
  fullAddress: string;
}

export interface ITutorRequest extends Document {
  _id: Types.ObjectId;
  studentId: Types.ObjectId;
  tutorId: Types.ObjectId;
  courseId?: Types.ObjectId;
  studentName: string;
  tutorName: string;
  tutorAvatarUrl?: string;
  subject: string;
  level: string;
  mode: "online" | "home";
  selectedSlot?: ISelectedSlot;
  meetingLink?: string;
  homeAddress?: IHomeAddress;
  message: string;
  status: RequestStatus;
  fee: number;
  scheduledAt?: Date;
  trialStartedAt?: Date;
  trialExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TutorRequestSchema = new Schema<ITutorRequest>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tutorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    studentName: { type: String, required: true },
    tutorName: { type: String, required: true },
    tutorAvatarUrl: { type: String },
    courseId: { type: Schema.Types.ObjectId, ref: "Course" },
    subject: { type: String, required: true },
    level: { type: String, required: true },
    mode: { type: String, enum: ["online", "home"], required: true },
    selectedSlot: {
      type: new Schema<ISelectedSlot>(
        {
          day: { type: String },
          startTime: { type: String },
          endTime: { type: String },
        },
        { _id: false },
      ),
      required: false,
    },
    meetingLink: { type: String },
    homeAddress: {
      type: new Schema<IHomeAddress>(
        { city: { type: String }, fullAddress: { type: String } },
        { _id: false },
      ),
      required: false,
    },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "trial", "completed"],
      default: "pending",
    },
    fee: { type: Number, required: true, min: 0 },
    scheduledAt: { type: Date },
    trialStartedAt: { type: Date },
    trialExpiresAt: { type: Date },
  },
  { timestamps: true },
);

TutorRequestSchema.index({ studentId: 1, status: 1 });
TutorRequestSchema.index({ tutorId: 1, status: 1 });
TutorRequestSchema.index({ createdAt: -1 });

export const TutorRequest = mongoose.model<ITutorRequest>(
  "TutorRequest",
  TutorRequestSchema,
);
