import { Course, ICourse } from "../models/Course.js";

export interface ICourseSlot {
  day: string;
  startTime: string;
  endTime: string;
}

export interface CourseCreateInput {
  tutorId: string;
  title: string;
  subject: string;
  level: string;
  description: string;
  fee: number;
  mode: "online" | "home" | "both";
  duration: string;
  availability?: { online: ICourseSlot[]; home: ICourseSlot[] };
}

export interface CourseUpdateInput {
  title?: string;
  subject?: string;
  level?: string;
  description?: string;
  fee?: number;
  mode?: "online" | "home" | "both";
  duration?: string;
  availability?: { online: ICourseSlot[]; home: ICourseSlot[] };
  isActive?: boolean;
}

export const courseRepository = {
  async findByTutorId(tutorId: string): Promise<ICourse[]> {
    return Course.find({ tutorId })
      .sort({ createdAt: -1 })
      .lean({ virtuals: true });
  },

  async findById(id: string): Promise<ICourse | null> {
    return Course.findById(id).lean({ virtuals: true });
  },

  async create(data: CourseCreateInput): Promise<ICourse> {
    const course = new Course(data);
    await course.save();
    return course.toObject({ virtuals: true });
  },

  async update(
    id: string,
    tutorId: string,
    data: CourseUpdateInput,
  ): Promise<ICourse | null> {
    return Course.findOneAndUpdate(
      { _id: id, tutorId },
      { $set: data },
      { new: true, runValidators: true },
    ).lean({ virtuals: true });
  },

  async delete(id: string, tutorId: string): Promise<boolean> {
    const result = await Course.deleteOne({ _id: id, tutorId });
    return result.deletedCount > 0;
  },

  async countByTutorId(tutorId: string): Promise<number> {
    return Course.countDocuments({ tutorId });
  },

  async findAll(filter: Record<string, any> = {}): Promise<ICourse[]> {
    return Course.find(filter).sort({ createdAt: -1 }).lean({ virtuals: true });
  },

  async adminCreate(data: CourseCreateInput): Promise<ICourse> {
    const course = new Course(data);
    await course.save();
    return course.toObject({ virtuals: true });
  },

  async adminUpdate(
    id: string,
    data: CourseUpdateInput,
  ): Promise<ICourse | null> {
    return Course.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true },
    ).lean({ virtuals: true });
  },

  async adminDelete(id: string): Promise<boolean> {
    const result = await Course.deleteOne({ _id: id });
    return result.deletedCount > 0;
  },
};
