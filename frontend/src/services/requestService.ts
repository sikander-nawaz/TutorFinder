import { api } from "./api";
import {
  TutorRequest,
  RequestStatus,
  TeachingMode,
  AvailabilitySlot,
  HomeAddress,
} from "@/types";

export interface CreateRequestPayload {
  tutorId: string;
  courseId?: string;
  subject: string;
  level: string;
  mode: TeachingMode;
  selectedSlot: AvailabilitySlot;
  homeAddress?: HomeAddress;
  message: string;
  fee: number;
}

function normalizeRequest(r: any): TutorRequest {
  return { ...r, id: (r._id || r.id)?.toString() };
}

export const requestService = {
  async createRequest(payload: CreateRequestPayload): Promise<TutorRequest> {
    const { data } = await api.post("/requests", payload);
    return data.data?.request
      ? normalizeRequest(data.data.request)
      : data.data?.request;
  },
  async getStudentRequests(): Promise<TutorRequest[]> {
    const { data } = await api.get("/requests/student");
    return (data.data?.requests || []).map(normalizeRequest);
  },
  async getTutorRequests(): Promise<TutorRequest[]> {
    const { data } = await api.get("/requests/tutor");
    return (data.data?.requests || []).map(normalizeRequest);
  },
  async getAllRequests(): Promise<TutorRequest[]> {
    const { data } = await api.get("/admin/requests");
    return (data.data?.requests || []).map(normalizeRequest);
  },
  async updateRequestStatus(
    id: string,
    status: RequestStatus,
    meetingLink?: string,
  ): Promise<TutorRequest> {
    const { data } = await api.patch(`/requests/${id}/status`, {
      status,
      ...(meetingLink ? { meetingLink } : {}),
    });
    return data.data?.request
      ? normalizeRequest(data.data.request)
      : data.data?.request;
  },
  async editRequest(
    id: string,
    payload: Partial<CreateRequestPayload>,
  ): Promise<TutorRequest> {
    const { data } = await api.patch(`/requests/${id}`, payload);
    return data.data?.request
      ? normalizeRequest(data.data.request)
      : data.data?.request;
  },
  async deleteRequest(id: string): Promise<void> {
    await api.delete(`/requests/${id}`);
  },
};
