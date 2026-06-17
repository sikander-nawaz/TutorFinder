import { api } from "./api";
import { AdminStats, User } from "@/types";

const TUTOR_DOC_META: Record<string, string> = {
  cnic_front: "CNIC (Front)",
  cnic_back: "CNIC (Back)",
  degree: "Degree Certificate",
  experience_letter: "Experience Letter",
};
const TUTOR_DOC_ORDER = [
  "cnic_front",
  "cnic_back",
  "degree",
  "experience_letter",
];

const STUDENT_DOC_META: Record<string, string> = {
  cnic_front: "CNIC (Front)",
  cnic_back: "CNIC (Back)",
  domicile: "Domicile Certificate",
  student_card: "Student Card / ID",
};
const STUDENT_DOC_ORDER = [
  "cnic_front",
  "cnic_back",
  "domicile",
  "student_card",
];

function normalizeTutorDocs(rawDocs: any[]) {
  const map: Record<string, any> = {};
  for (const d of rawDocs) map[d.docType] = d;
  return TUTOR_DOC_ORDER.map((t) => ({
    type: t,
    label: TUTOR_DOC_META[t],
    submitted: !!map[t],
    url: map[t]?.url ?? null,
  }));
}

function normalizeStudentDocs(rawDocs: any[]) {
  const map: Record<string, any> = {};
  for (const d of rawDocs) map[d.docType] = d;
  return STUDENT_DOC_ORDER.map((t) => ({
    type: t,
    label: STUDENT_DOC_META[t],
    submitted: !!map[t],
    url: map[t]?.url ?? null,
  }));
}

export const adminService = {
  async getStats(): Promise<AdminStats> {
    const { data } = await api.get("/admin/stats");
    return data.data;
  },
  async getUsers(params?: { role?: string; search?: string }): Promise<User[]> {
    const { data } = await api.get("/admin/users", { params });
    return (data.data.users || []).map((u: any) => ({
      ...u,
      id: (u._id || u.id)?.toString(),
    }));
  },
  async blockUser(userId: string): Promise<void> {
    await api.patch(`/admin/users/${userId}/block`);
  },
  async unblockUser(userId: string): Promise<void> {
    await api.patch(`/admin/users/${userId}/unblock`);
  },
  async getPendingTutors(): Promise<any[]> {
    const { data } = await api.get("/admin/tutors/pending");
    return (data.data.tutors as any[]).map((t) => ({
      ...t,
      documents: normalizeTutorDocs(t.documents ?? []),
    }));
  },
  async approveTutor(profileId: string): Promise<void> {
    await api.patch(`/admin/tutors/${profileId}/verify`);
  },
  async rejectTutor(profileId: string, reason: string): Promise<void> {
    await api.patch(`/admin/tutors/${profileId}/reject`, { reason });
  },
  async scheduleInterview(
    profileId: string,
    payload: { interviewLink: string; interviewDate: string; notes?: string },
  ): Promise<void> {
    await api.patch(`/admin/tutors/${profileId}/interview`, payload);
  },
  async getPendingStudents(): Promise<any[]> {
    const { data } = await api.get("/admin/students/pending");
    return (data.data.students as any[]).map((s) => ({
      ...s,
      documents: normalizeStudentDocs(s.documents ?? []),
    }));
  },
  async approveStudent(profileId: string): Promise<void> {
    await api.patch(`/admin/students/${profileId}/verify`);
  },
  async rejectStudent(profileId: string, reason: string): Promise<void> {
    await api.patch(`/admin/students/${profileId}/reject`, { reason });
  },
  async getAllRequests(params?: {
    status?: string;
    search?: string;
  }): Promise<any[]> {
    const { data } = await api.get("/admin/requests", { params });
    return data.data.requests;
  },
  async acceptRequest(id: string): Promise<void> {
    await api.patch(`/admin/requests/${id}/accept`);
  },
  async rejectRequest(id: string): Promise<void> {
    await api.patch(`/admin/requests/${id}/reject`);
  },
  async deleteRequest(id: string): Promise<void> {
    await api.delete(`/admin/requests/${id}`);
  },
  async getCourses(params?: {
    tutorId?: string;
    subject?: string;
    search?: string;
  }): Promise<any[]> {
    const { data } = await api.get("/admin/courses", { params });
    return data.data.courses || [];
  },
  async createCourse(payload: {
    tutorId: string;
    title: string;
    subject: string;
    level: string;
    description: string;
    fee: number;
    mode: "online" | "home" | "both";
    duration: string;
  }): Promise<any> {
    const { data } = await api.post("/admin/courses", payload);
    return data.data.course;
  },
  async updateCourse(
    id: string,
    payload: Partial<{
      title: string;
      subject: string;
      level: string;
      description: string;
      fee: number;
      mode: "online" | "home" | "both";
      duration: string;
      isActive: boolean;
    }>,
  ): Promise<any> {
    const { data } = await api.patch(`/admin/courses/${id}`, payload);
    return data.data.course;
  },
  async deleteCourse(id: string): Promise<void> {
    await api.delete(`/admin/courses/${id}`);
  },
};
