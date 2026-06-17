import { api } from "./api";
import { Course, EarningsSummary, TutorProfile } from "@/types";

export const tutorService = {
  async getMyProfile(): Promise<TutorProfile> {
    const { data } = await api.get("/profile");
    const { user, profile } = data.data;
    const type: string = profile.tutoringType || "online";
    const modes: import("@/types").TeachingMode[] = profile.teachingModes
      ?.length
      ? profile.teachingModes
      : type === "both"
        ? ["online", "home"]
        : [type as import("@/types").TeachingMode];
    return {
      id: profile._id || profile.id,
      userId: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      city: user.city || "",
      subjects: profile.subjects || [],
      levels: profile.levels || [],
      level: (profile.levels || [])[0] || "",
      experience: profile.experience || 0,
      hourlyRate: profile.hourlyRate || 0,
      bio: profile.bio || "",
      rating: profile.averageRating || 0,
      reviewCount: profile.totalReviews || 0,
      verified: profile.verificationStatus === "approved",
      tutoringType: type as import("@/types").TutoringMode,
      teachingModes: modes,
      availability: profile.availability || { online: [], home: [] },
      homeTuitionCities: profile.homeTuitionCities || [],
      online: modes.includes("online"),
      homeVisit: modes.includes("home"),
      education: profile.qualification,
      qualification: profile.qualification || "",
      isProfileComplete: profile.isProfileComplete,
      createdAt: profile.createdAt,
    };
  },
  async updateMyProfile(payload: Record<string, any>): Promise<TutorProfile> {
    const { data } = await api.patch("/profile", payload);
    const { user, profile } = data.data;
    const type: string = profile.tutoringType || "online";
    const modes: import("@/types").TeachingMode[] = profile.teachingModes
      ?.length
      ? profile.teachingModes
      : type === "both"
        ? ["online", "home"]
        : [type as import("@/types").TeachingMode];
    return {
      id: profile._id || profile.id,
      userId: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      city: user.city || "",
      subjects: profile.subjects || [],
      levels: profile.levels || [],
      level: (profile.levels || [])[0] || "",
      experience: profile.experience || 0,
      hourlyRate: profile.hourlyRate || 0,
      bio: profile.bio || "",
      rating: profile.averageRating || 0,
      reviewCount: profile.totalReviews || 0,
      verified: profile.verificationStatus === "approved",
      tutoringType: type as import("@/types").TutoringMode,
      teachingModes: modes,
      availability: profile.availability || { online: [], home: [] },
      homeTuitionCities: profile.homeTuitionCities || [],
      online: modes.includes("online"),
      homeVisit: modes.includes("home"),
      education: profile.qualification,
      qualification: profile.qualification || "",
      isProfileComplete: profile.isProfileComplete,
      createdAt: profile.createdAt,
    };
  },
  async getMyCourses(): Promise<Course[]> {
    const { data } = await api.get("/tutor/courses");
    const courses = data.data?.courses || [];
    return courses.map((c: any) => ({ ...c, id: (c._id || c.id)?.toString() }));
  },
  async createCourse(
    payload: Omit<Course, "id" | "tutorId" | "createdAt">,
  ): Promise<Course> {
    const { data } = await api.post("/tutor/courses", payload);
    const c = data.data?.course;
    return c ? { ...c, id: (c._id || c.id)?.toString() } : c;
  },
  async updateCourse(id: string, payload: Partial<Course>): Promise<Course> {
    const { data } = await api.patch(`/tutor/courses/${id}`, payload);
    const c = data.data?.course;
    return c ? { ...c, id: (c._id || c.id)?.toString() } : c;
  },
  async deleteCourse(id: string): Promise<void> {
    await api.delete(`/tutor/courses/${id}`);
  },
  async uploadAvatar(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("avatar", file);
    const { data } = await api.post("/profile/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data.avatarUrl;
  },
  async getEarnings(): Promise<EarningsSummary> {
    const { data } = await api.get("/tutor/earnings");
    return data.data;
  },
};
