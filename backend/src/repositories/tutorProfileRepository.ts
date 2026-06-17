import { TutorProfile, ITutorProfile } from "../models/TutorProfile.js";

export const tutorProfileRepository = {
  async findByUserId(userId: string): Promise<ITutorProfile | null> {
    return TutorProfile.findOne({ userId }).exec();
  },

  async create(data: Partial<ITutorProfile>): Promise<ITutorProfile> {
    const profile = new TutorProfile(data);
    return profile.save();
  },

  async updateByUserId(
    userId: string,
    data: Partial<ITutorProfile>
  ): Promise<ITutorProfile | null> {
    return TutorProfile.findOneAndUpdate(
      { userId },
      { $set: data },
      { new: true, runValidators: true }
    ).exec();
  },

  async upsertByUserId(
    userId: string,
    data: Partial<ITutorProfile>
  ): Promise<ITutorProfile> {
    const profile = await TutorProfile.findOneAndUpdate(
      { userId },
      { $set: data },
      { new: true, upsert: true, runValidators: true }
    ).exec();
    return profile!;
  },
};
