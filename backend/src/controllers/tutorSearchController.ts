import type { Request, Response, NextFunction } from "express";
import { TutorProfile } from "../models/TutorProfile.js";
import { User } from "../models/User.js";
import { Course } from "../models/Course.js";
import { sendSuccess } from "../utils/response.js";
import { NotFoundError } from "../utils/errors.js";

export const tutorSearchController = {
  async searchTutors(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const {
        city,
        subject,
        level,
        minPrice,
        maxPrice,
        maxRate,
        sortBy,
        verified,
        search,
      } = req.query;

      // Build profile filter
      const profileFilter: Record<string, any> = {};

      // Always show only verified tutors in public search
      profileFilter.verificationStatus = "approved";
      profileFilter.isProfileComplete = true;

      if (subject) {
        profileFilter.subjects = { $regex: subject as string, $options: "i" };
      }
      if (level) {
        profileFilter.levels = { $regex: level as string, $options: "i" };
      }

      const effectiveMaxPrice = maxRate || maxPrice;
      if (minPrice || effectiveMaxPrice) {
        profileFilter.hourlyRate = {};
        if (minPrice) profileFilter.hourlyRate.$gte = Number(minPrice);
        if (effectiveMaxPrice)
          profileFilter.hourlyRate.$lte = Number(effectiveMaxPrice);
      }

      // Build sort
      let sort: Record<string, 1 | -1> = { averageRating: -1 };
      if (sortBy === "price_asc") sort = { hourlyRate: 1 };
      else if (sortBy === "price_desc") sort = { hourlyRate: -1 };
      else if (sortBy === "rating") sort = { averageRating: -1 };
      else if (sortBy === "experience") sort = { experience: -1 };

      const profiles = await TutorProfile.find(profileFilter).sort(sort).lean();
      const userIds = profiles.map((p) => p.userId.toString());

      // Build user filter (for city and text search)
      const userFilter: Record<string, any> = {
        _id: { $in: userIds },
        isBlocked: false,
        isActive: true,
      };
      if (city) {
        userFilter.city = { $regex: city as string, $options: "i" };
      }
      if (search) {
        userFilter.name = { $regex: search as string, $options: "i" };
      }

      const users = await User.find(userFilter).lean();
      const userMap = Object.fromEntries(
        users.map((u) => [u._id.toString(), u]),
      );

      const tutors = profiles
        .filter((p) => userMap[p.userId.toString()])
        .map((p) => {
          const user = userMap[p.userId.toString()];
          return {
            id: p._id.toString(),
            userId: p.userId.toString(),
            name: user.name,
            email: user.email,
            city: user.city || "",
            avatarUrl: user.avatarUrl || "",
            subjects: p.subjects || [],
            levels: p.levels || [],
            level: (p.levels || [])[0] || "",
            tutoringType: p.tutoringType,
            teachingModes: p.teachingModes || [],
            availability: p.availability || { online: [], home: [] },
            homeTuitionCities: p.homeTuitionCities || [],
            online:
              (p.teachingModes || []).includes("online") ||
              p.tutoringType === "online" ||
              p.tutoringType === "both",
            homeVisit:
              (p.teachingModes || []).includes("home") ||
              p.tutoringType === "home" ||
              p.tutoringType === "both",
            hourlyRate: p.hourlyRate || 0,
            experience: p.experience || 0,
            qualification: p.qualification || "",
            education: p.qualification || "",
            bio: p.bio || "",
            rating: p.averageRating ?? 0,
            reviewCount: p.totalReviews ?? 0,
            averageRating: p.averageRating ?? 0,
            totalReviews: p.totalReviews ?? 0,
            verified: true,
          };
        });

      sendSuccess({ res, data: { tutors, total: tutors.length } });
    } catch (err) {
      next(err);
    }
  },

  async getTutorById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      // id can be either userId or profileId
      let profile = await TutorProfile.findById(id as string).lean();
      if (!profile) {
        profile = await TutorProfile.findOne({ userId: id }).lean();
      }
      if (!profile) throw new NotFoundError("Tutor not found");

      const user = await User.findById(profile.userId).lean();
      if (!user || user.isBlocked) throw new NotFoundError("Tutor not found");

      const normalized = {
        id: profile._id.toString(),
        userId: profile.userId.toString(),
        name: user.name,
        email: user.email,
        city: user.city || "",
        avatarUrl: user.avatarUrl || "",
        subjects: profile.subjects,
        levels: profile.levels,
        level: profile.levels[0] || "",
        tutoringType: profile.tutoringType,
        teachingModes: (profile as any).teachingModes || [],
        availability: (profile as any).availability || { online: [], home: [] },
        homeTuitionCities: (profile as any).homeTuitionCities || [],
        online:
          ((profile as any).teachingModes || []).includes("online") ||
          profile.tutoringType === "online" ||
          profile.tutoringType === "both",
        homeVisit:
          ((profile as any).teachingModes || []).includes("home") ||
          profile.tutoringType === "home" ||
          profile.tutoringType === "both",
        hourlyRate: profile.hourlyRate || 0,
        experience: profile.experience || 0,
        qualification: profile.qualification || "",
        education: profile.qualification || "",
        bio: profile.bio || "",
        rating: profile.averageRating,
        reviewCount: profile.totalReviews,
        averageRating: profile.averageRating,
        totalReviews: profile.totalReviews,
        verified: profile.verificationStatus === "approved",
        verificationStatus: profile.verificationStatus,
      };

      const courses = await Course.find({
        tutorId: profile.userId,
        isActive: true,
      })
        .sort({ createdAt: -1 })
        .lean();

      sendSuccess({ res, data: { tutor: { ...normalized, courses } } });
    } catch (err) {
      next(err);
    }
  },
};
