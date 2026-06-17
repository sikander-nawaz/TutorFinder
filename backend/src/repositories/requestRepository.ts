import {
  TutorRequest,
  ITutorRequest,
  RequestStatus,
} from "../models/TutorRequest.js";
import type { Types } from "mongoose";

export interface ISlot {
  day: string;
  startTime: string;
  endTime: string;
}
export interface IAddress {
  city: string;
  fullAddress: string;
}

export interface RequestCreateInput {
  studentId: string;
  tutorId: string;
  courseId?: string;
  studentName: string;
  tutorName: string;
  tutorAvatarUrl?: string;
  subject: string;
  level: string;
  mode: "online" | "home";
  selectedSlot?: ISlot;
  meetingLink?: string;
  homeAddress?: IAddress;
  message: string;
  fee: number;
  scheduledAt?: Date;
}

export interface RequestUpdateInput {
  subject?: string;
  level?: string;
  mode?: "online" | "home";
  selectedSlot?: ISlot;
  meetingLink?: string;
  homeAddress?: IAddress;
  message?: string;
  fee?: number;
  scheduledAt?: Date;
  status?: RequestStatus;
  trialStartedAt?: Date;
  trialExpiresAt?: Date;
}

export const requestRepository = {
  async findByStudentId(studentId: string): Promise<ITutorRequest[]> {
    return TutorRequest.find({ studentId })
      .sort({ createdAt: -1 })
      .lean({ virtuals: true });
  },

  async findByTutorId(tutorId: string): Promise<ITutorRequest[]> {
    return TutorRequest.find({ tutorId })
      .sort({ createdAt: -1 })
      .lean({ virtuals: true });
  },

  async findAll(): Promise<ITutorRequest[]> {
    return TutorRequest.find().sort({ createdAt: -1 }).lean({ virtuals: true });
  },

  async findById(id: string): Promise<ITutorRequest | null> {
    return TutorRequest.findById(id).lean({ virtuals: true });
  },

  async create(data: RequestCreateInput): Promise<ITutorRequest> {
    const request = new TutorRequest(data);
    await request.save();
    return request.toObject({ virtuals: true });
  },

  async update(
    id: string,
    data: RequestUpdateInput,
  ): Promise<ITutorRequest | null> {
    return TutorRequest.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true },
    ).lean({ virtuals: true });
  },

  async updateStatus(
    id: string,
    status: RequestStatus,
  ): Promise<ITutorRequest | null> {
    return TutorRequest.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true },
    ).lean({ virtuals: true });
  },

  async delete(id: string): Promise<boolean> {
    const result = await TutorRequest.deleteOne({ _id: id });
    return result.deletedCount > 0;
  },

  async countByTutorId(tutorId: string): Promise<number> {
    return TutorRequest.countDocuments({ tutorId });
  },

  async countByStudentId(studentId: string): Promise<number> {
    return TutorRequest.countDocuments({ studentId });
  },

  async countByStatus(tutorId: string, status: RequestStatus): Promise<number> {
    return TutorRequest.countDocuments({ tutorId, status });
  },
};
