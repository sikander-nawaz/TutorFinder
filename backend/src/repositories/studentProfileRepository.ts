import { StudentProfile, IStudentProfile } from "../models/StudentProfile.js";

export const studentProfileRepository = {
  async findByUserId(userId: string): Promise<IStudentProfile | null> {
    return StudentProfile.findOne({ userId }).exec();
  },

  async create(data: Partial<IStudentProfile>): Promise<IStudentProfile> {
    const profile = new StudentProfile(data);
    return profile.save();
  },

  async updateByUserId(
    userId: string,
    data: Partial<IStudentProfile>
  ): Promise<IStudentProfile | null> {
    return StudentProfile.findOneAndUpdate(
      { userId },
      { $set: data },
      { new: true, runValidators: true }
    ).exec();
  },

  async upsertByUserId(
    userId: string,
    data: Partial<IStudentProfile>
  ): Promise<IStudentProfile> {
    const profile = await StudentProfile.findOneAndUpdate(
      { userId },
      { $set: data },
      { new: true, upsert: true, runValidators: true }
    ).exec();
    return profile!;
  },
};
