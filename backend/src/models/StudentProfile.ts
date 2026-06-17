import mongoose, { Document, Schema, Types } from "mongoose";

export type StudentVerificationStatus =
  | "unverified"
  | "pending_review"
  | "approved"
  | "rejected"
  | "reapplication";

export type StudentDocType = "cnic_front" | "cnic_back" | "domicile" | "student_card";

export interface IStudentDocument {
  docType: StudentDocType;
  url: string;
  publicId: string;
  uploadedAt: Date;
}

export interface IStudentProfile extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  classLevel?: string;
  institution?: string;
  documents: IStudentDocument[];
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  verificationStatus: StudentVerificationStatus;
  verificationNotes?: string;
  rejectedAt?: Date;
  isProfileComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StudentDocumentSchema = new Schema<IStudentDocument>(
  {
    docType: {
      type: String,
      enum: ["cnic_front", "cnic_back", "domicile", "student_card"],
      required: true,
    },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const StudentProfileSchema = new Schema<IStudentProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    classLevel: { type: String, trim: true },
    institution: { type: String, trim: true },
    documents: { type: [StudentDocumentSchema], default: [] },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    verificationStatus: {
      type: String,
      enum: ["unverified", "pending_review", "approved", "rejected", "reapplication"],
      default: "unverified",
    },
    verificationNotes: { type: String },
    rejectedAt: { type: Date },
    isProfileComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);


export const StudentProfile = mongoose.model<IStudentProfile>("StudentProfile", StudentProfileSchema);
