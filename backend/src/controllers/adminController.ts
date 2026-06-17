import type { Request, Response, NextFunction } from "express";
import { User } from "../models/User.js";
import { TutorProfile } from "../models/TutorProfile.js";
import { StudentProfile } from "../models/StudentProfile.js";
import { TutorRequest } from "../models/TutorRequest.js";
import { userRepository } from "../repositories/userRepository.js";
import { tutorProfileRepository } from "../repositories/tutorProfileRepository.js";
import { courseRepository } from "../repositories/courseRepository.js";
import { sendSuccess } from "../utils/response.js";
import { BadRequestError, NotFoundError } from "../utils/errors.js";

export const adminController = {
  async getStats(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const [
        totalUsers,
        totalTutors,
        totalStudents,
        totalRequests,
        pendingVerifications,
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: "tutor" }),
        User.countDocuments({ role: "student" }),
        TutorRequest.countDocuments(),
        TutorProfile.countDocuments({
          verificationStatus: { $in: ["documents_submitted", "reapplication"] },
        }),
      ]);

      // Request breakdown by status
      const statusAgg = await TutorRequest.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]);
      const requestsByStatus = statusAgg.map((s) => ({
        status: s._id,
        count: s.count,
      }));

      // Monthly revenue from completed requests (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const revenueAgg = await TutorRequest.aggregate([
        { $match: { status: "completed", createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            revenue: { $sum: "$fee" },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]);

      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const revenueData = revenueAgg.map((r) => ({
        month: monthNames[r._id.month - 1],
        revenue: Math.round(r.revenue * 0.1), // platform 10% commission
      }));

      const monthlyRevenue = revenueData.reduce((sum, r) => sum + r.revenue, 0);

      // User growth (last 6 months)
      const userGrowthAgg = await User.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              role: "$role",
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]);

      const growthMap: Record<string, { students: number; tutors: number }> =
        {};
      for (const entry of userGrowthAgg) {
        const key = `${entry._id.year}-${entry._id.month}`;
        if (!growthMap[key]) growthMap[key] = { students: 0, tutors: 0 };
        if (entry._id.role === "student") growthMap[key].students = entry.count;
        if (entry._id.role === "tutor") growthMap[key].tutors = entry.count;
      }

      const userGrowth = Object.entries(growthMap).map(([key, val]) => {
        const [year, month] = key.split("-").map(Number);
        return { month: monthNames[month - 1], ...val };
      });

      sendSuccess({
        res,
        data: {
          totalUsers,
          totalTutors,
          totalStudents,
          totalRequests,
          pendingVerifications,
          activeChats: 0,
          monthlyRevenue,
          revenueData,
          requestsByStatus,
          userGrowth,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async getUsers(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { role, search } = req.query;
      const filter: Record<string, any> = {};
      if (role && ["student", "tutor", "admin"].includes(role as string)) {
        filter.role = role;
      }
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }
      const users = await User.find(filter)
        .sort({ createdAt: -1 })
        .lean({ virtuals: true });
      sendSuccess({ res, data: { users } });
    } catch (err) {
      next(err);
    }
  },

  async blockUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const user = await userRepository.updateById(id as string, {
        isBlocked: true,
      });
      if (!user) throw new NotFoundError("User not found");
      sendSuccess({ res, message: "User blocked" });
    } catch (err) {
      next(err);
    }
  },

  async unblockUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const user = await userRepository.updateById(id as string, {
        isBlocked: false,
      });
      if (!user) throw new NotFoundError("User not found");
      sendSuccess({ res, message: "User unblocked" });
    } catch (err) {
      next(err);
    }
  },

  async getPendingTutors(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const profiles = await TutorProfile.find({
        verificationStatus: {
          $in: ["documents_submitted", "interview_scheduled", "reapplication"],
        },
      }).lean({ virtuals: true });

      const userIds = profiles.map((p) => p.userId.toString());
      const users = await User.find({ _id: { $in: userIds } }).lean({
        virtuals: true,
      });
      const userMap = Object.fromEntries(
        users.map((u) => [u._id.toString(), u]),
      );

      const tutors = profiles.map((p) => ({
        id: p._id.toString(),
        userId: p.userId.toString(),
        name: userMap[p.userId.toString()]?.name || "",
        email: userMap[p.userId.toString()]?.email || "",
        city: userMap[p.userId.toString()]?.city || "",
        cnic: userMap[p.userId.toString()]?.cnic || "",
        avatarUrl: userMap[p.userId.toString()]?.avatarUrl || "",
        subjects: p.subjects,
        levels: p.levels,
        experience: p.experience || 0,
        hourlyRate: p.hourlyRate || 0,
        qualification: p.qualification || "",
        bio: p.bio || "",
        status: p.verificationStatus,
        documents: p.documents,
        verificationNotes: p.verificationNotes,
        interviewLink: p.interviewLink,
        interviewDate: p.interviewDate,
        submittedAt: p.updatedAt,
      }));

      sendSuccess({ res, data: { tutors } });
    } catch (err) {
      next(err);
    }
  },

  async approveTutor(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const profile = await TutorProfile.findByIdAndUpdate(
        id,
        { $set: { verificationStatus: "approved" } },
        { new: true },
      );
      if (!profile) throw new NotFoundError("Tutor profile not found");
      sendSuccess({ res, message: "Tutor approved" });
    } catch (err) {
      next(err);
    }
  },

  async rejectTutor(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body as { reason?: string };
      const profile = await TutorProfile.findByIdAndUpdate(
        id,
        {
          $set: {
            verificationStatus: "rejected",
            verificationNotes: reason || "Application rejected",
            rejectedAt: new Date(),
          },
        },
        { new: true },
      );
      if (!profile) throw new NotFoundError("Tutor profile not found");
      sendSuccess({ res, message: "Tutor rejected" });
    } catch (err) {
      next(err);
    }
  },

  async scheduleInterview(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { interviewLink, interviewDate, notes } = req.body as {
        interviewLink: string;
        interviewDate: string;
        notes?: string;
      };
      if (!interviewLink || !interviewDate) {
        throw new BadRequestError("Interview link and date are required");
      }
      const profile = await TutorProfile.findByIdAndUpdate(
        id,
        {
          $set: {
            verificationStatus: "interview_scheduled",
            interviewLink,
            interviewDate: new Date(interviewDate),
            ...(notes && { verificationNotes: notes }),
          },
        },
        { new: true },
      );
      if (!profile) throw new NotFoundError("Tutor profile not found");
      sendSuccess({ res, message: "Interview scheduled" });
    } catch (err) {
      next(err);
    }
  },

  async getPendingStudents(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const profiles = await StudentProfile.find({
        verificationStatus: { $in: ["pending_review", "reapplication"] },
      }).lean();

      const userIds = profiles.map((p) => p.userId.toString());
      const users = await User.find({ _id: { $in: userIds } }).lean();
      const userMap = Object.fromEntries(
        users.map((u) => [u._id.toString(), u]),
      );

      const students = profiles.map((p) => ({
        id: p._id.toString(),
        userId: p.userId.toString(),
        name: userMap[p.userId.toString()]?.name || "",
        email: userMap[p.userId.toString()]?.email || "",
        city: userMap[p.userId.toString()]?.city || "",
        cnic: userMap[p.userId.toString()]?.cnic || "",
        avatarUrl: userMap[p.userId.toString()]?.avatarUrl || "",
        classLevel: p.classLevel || "",
        institution: p.institution || "",
        status: p.verificationStatus,
        documents: p.documents,
        verificationNotes: p.verificationNotes,
        rejectedAt: p.rejectedAt,
        submittedAt: p.updatedAt,
      }));

      sendSuccess({ res, data: { students } });
    } catch (err) {
      next(err);
    }
  },

  async approveStudent(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const profile = await StudentProfile.findByIdAndUpdate(
        id,
        { $set: { verificationStatus: "approved" } },
        { new: true },
      );
      if (!profile) throw new NotFoundError("Student profile not found");
      sendSuccess({ res, message: "Student approved" });
    } catch (err) {
      next(err);
    }
  },

  async rejectStudent(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body as { reason?: string };
      const profile = await StudentProfile.findByIdAndUpdate(
        id,
        {
          $set: {
            verificationStatus: "rejected",
            verificationNotes: reason || "Application rejected",
            rejectedAt: new Date(),
          },
        },
        { new: true },
      );
      if (!profile) throw new NotFoundError("Student profile not found");
      sendSuccess({ res, message: "Student rejected" });
    } catch (err) {
      next(err);
    }
  },

  async getAllRequests(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { status, search } = req.query;
      const filter: Record<string, any> = {};
      if (status && status !== "all") filter.status = status;
      if (search) {
        const re = { $regex: search as string, $options: "i" };
        filter.$or = [{ studentName: re }, { tutorName: re }, { subject: re }];
      }
      const requests = await TutorRequest.find(filter)
        .sort({ createdAt: -1 })
        .lean({ virtuals: true });
      sendSuccess({ res, data: { requests } });
    } catch (err) {
      next(err);
    }
  },

  async acceptRequest(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const request = await TutorRequest.findByIdAndUpdate(
        id,
        { $set: { status: "approved" } },
        { new: true },
      );
      if (!request) throw new NotFoundError("Request not found");
      sendSuccess({ res, message: "Request accepted" });
    } catch (err) {
      next(err);
    }
  },

  async rejectRequest(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const request = await TutorRequest.findByIdAndUpdate(
        id,
        { $set: { status: "rejected" } },
        { new: true },
      );
      if (!request) throw new NotFoundError("Request not found");
      sendSuccess({ res, message: "Request rejected" });
    } catch (err) {
      next(err);
    }
  },

  async deleteRequest(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const request = await TutorRequest.findByIdAndDelete(id);
      if (!request) throw new NotFoundError("Request not found");
      sendSuccess({ res, message: "Request deleted" });
    } catch (err) {
      next(err);
    }
  },

  async getCourses(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { tutorId, subject, search } = req.query;
      const filter: Record<string, any> = {};
      if (tutorId) filter.tutorId = tutorId;
      if (subject)
        filter.subject = { $regex: subject as string, $options: "i" };
      if (search) filter.title = { $regex: search as string, $options: "i" };

      const courses = await courseRepository.findAll(filter);
      const tutorIds = [...new Set(courses.map((c) => c.tutorId.toString()))];
      const tutors = await User.find({ _id: { $in: tutorIds } }).lean();
      const tutorMap = Object.fromEntries(
        tutors.map((t) => [t._id.toString(), t.name]),
      );

      const normalized = courses.map((c) => ({
        id: c._id.toString(),
        tutorId: c.tutorId.toString(),
        tutorName: tutorMap[c.tutorId.toString()] || "Unknown",
        title: c.title,
        subject: c.subject,
        level: c.level,
        description: c.description,
        fee: c.fee,
        mode: c.mode,
        duration: c.duration,
        isActive: c.isActive,
        createdAt: c.createdAt,
      }));

      sendSuccess({
        res,
        data: { courses: normalized, total: normalized.length },
      });
    } catch (err) {
      next(err);
    }
  },

  async createCourse(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const {
        tutorId,
        title,
        subject,
        level,
        description,
        fee,
        mode,
        duration,
      } = req.body as {
        tutorId: string;
        title: string;
        subject: string;
        level: string;
        description: string;
        fee: number;
        mode: "online" | "home" | "both";
        duration: string;
      };
      if (
        !tutorId ||
        !title ||
        !subject ||
        !level ||
        !description ||
        fee == null ||
        !mode ||
        !duration
      ) {
        throw new BadRequestError("All course fields are required");
      }
      const tutor = await User.findById(tutorId);
      if (!tutor || tutor.role !== "tutor")
        throw new NotFoundError("Tutor not found");

      const course = await courseRepository.adminCreate({
        tutorId,
        title,
        subject,
        level,
        description,
        fee: Number(fee),
        mode,
        duration,
      });
      sendSuccess({
        res,
        statusCode: 201,
        message: "Course created",
        data: { course: { ...course, id: course._id.toString() } },
      });
    } catch (err) {
      next(err);
    }
  },

  async updateCourse(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const course = await courseRepository.adminUpdate(id as string, req.body);
      if (!course) throw new NotFoundError("Course not found");
      sendSuccess({
        res,
        message: "Course updated",
        data: { course: { ...course, id: course._id.toString() } },
      });
    } catch (err) {
      next(err);
    }
  },

  async deleteCourse(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await courseRepository.adminDelete(id as string);
      if (!deleted) throw new NotFoundError("Course not found");
      sendSuccess({ res, message: "Course deleted" });
    } catch (err) {
      next(err);
    }
  },
};
