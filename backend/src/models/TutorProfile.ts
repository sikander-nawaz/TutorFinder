import mongoose, { Document, Schema, Types } from "mongoose";

export type TutoringType = "online" | "home" | "both";
export type TeachingMode = "online" | "home";

export interface IAvailabilitySlot {
  day: string;
  startTime: string;
  endTime: string;
}

export type TutorVerificationStatus =
  | "unverified"
  | "documents_submitted"
  | "interview_scheduled"
  | "approved"
  | "rejected"
  | "reapplication";

export type TutorDocType =
  | "cnic_front"
  | "cnic_back"
  | "degree"
  | "experience_letter";

export interface ITutorDocument {
  docType: TutorDocType;
  url: string;
  publicId: string;
  uploadedAt: Date;
}

export interface ITutorProfile extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  bio?: string;
  subjects: string[];
  levels: string[];
  tutoringType: TutoringType;
  teachingModes: TeachingMode[];
  availability: {
    online: IAvailabilitySlot[];
    home: IAvailabilitySlot[];
  };
  homeTuitionCities: string[];
  hourlyRate?: number;
  experience?: number;
  qualification?: string;
  documents: ITutorDocument[];
  verificationStatus: TutorVerificationStatus;
  verificationNotes?: string;
  rejectedAt?: Date;
  interviewLink?: string;
  interviewDate?: Date;
  averageRating: number;
  totalReviews: number;
  isProfileComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TutorDocumentSchema = new Schema<ITutorDocument>(
  {
    docType: {
      type: String,
      enum: ["cnic_front", "cnic_back", "degree", "experience_letter"],
      required: true,
    },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const AvailabilitySlotSchema = new Schema<IAvailabilitySlot>(
  {
    day: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { _id: false },
);

const TutorProfileSchema = new Schema<ITutorProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    bio: { type: String, trim: true },
    subjects: { type: [String], default: [] },
    levels: { type: [String], default: [] },
    tutoringType: {
      type: String,
      enum: ["online", "home", "both"],
      default: "online",
    },
    teachingModes: {
      type: [String],
      enum: ["online", "home"],
      default: ["online"],
    },
    availability: {
      online: { type: [AvailabilitySlotSchema], default: [] },
      home: { type: [AvailabilitySlotSchema], default: [] },
    },
    homeTuitionCities: { type: [String], default: [] },
    hourlyRate: { type: Number, min: 0 },
    experience: { type: Number, min: 0 },
    qualification: { type: String, trim: true },
    documents: { type: [TutorDocumentSchema], default: [] },
    verificationStatus: {
      type: String,
      enum: [
        "unverified",
        "documents_submitted",
        "interview_scheduled",
        "approved",
        "rejected",
        "reapplication",
      ],
      default: "unverified",
    },
    verificationNotes: { type: String },
    rejectedAt: { type: Date },
    interviewLink: { type: String },
    interviewDate: { type: Date },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    isProfileComplete: { type: Boolean, default: false },
  },
  { timestamps: true },
);

TutorProfileSchema.index({ verificationStatus: 1 });
TutorProfileSchema.index({ subjects: 1 });

export const TutorProfile = mongoose.model<ITutorProfile>(
  "TutorProfile",
  TutorProfileSchema,
);
