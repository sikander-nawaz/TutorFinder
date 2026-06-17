import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { TutorRequest, RequestStatus } from "@/types";
import {
  requestService,
  CreateRequestPayload,
} from "@/services/requestService";
import { useToast } from "@/hooks/use-toast";

interface RequestContextValue {
  requests: TutorRequest[];
  isLoading: boolean;
  fetchStudentRequests: () => Promise<void>;
  fetchTutorRequests: () => Promise<void>;
  createRequest: (payload: CreateRequestPayload) => Promise<void>;
  updateStatus: (
    id: string,
    status: RequestStatus,
    meetingLink?: string,
  ) => Promise<void>;
  editRequest: (
    id: string,
    payload: Partial<CreateRequestPayload>,
  ) => Promise<void>;
  deleteRequest: (id: string) => Promise<void>;
}

const RequestContext = createContext<RequestContextValue | null>(null);

export function RequestProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<TutorRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchStudentRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await requestService.getStudentRequests();
      setRequests(data);
    } catch {
      toast({ title: "Failed to load requests", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTutorRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await requestService.getTutorRequests();
      setRequests(data);
    } catch {
      toast({ title: "Failed to load requests", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createRequest = async (payload: CreateRequestPayload) => {
    const req = await requestService.createRequest(payload);
    setRequests((prev) => [req, ...prev]);
    toast({ title: "Request sent successfully" });
  };

  const updateStatus = async (
    id: string,
    status: RequestStatus,
    meetingLink?: string,
  ) => {
    const updated = await requestService.updateRequestStatus(
      id,
      status,
      meetingLink,
    );
    if (updated)
      setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
    toast({ title: `Request ${status}` });
  };

  const editRequest = async (
    id: string,
    payload: Partial<CreateRequestPayload>,
  ) => {
    const updated = await requestService.editRequest(id, payload);
    if (updated)
      setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
    toast({ title: "Request updated" });
  };

  const deleteRequest = async (id: string) => {
    await requestService.deleteRequest(id);
    setRequests((prev) => prev.filter((r) => r.id !== id));
    toast({ title: "Request deleted" });
  };

  return (
    <RequestContext.Provider
      value={{
        requests,
        isLoading,
        fetchStudentRequests,
        fetchTutorRequests,
        createRequest,
        updateStatus,
        editRequest,
        deleteRequest,
      }}
    >
      {children}
    </RequestContext.Provider>
  );
}

export function useRequests() {
  const ctx = useContext(RequestContext);
  if (!ctx) throw new Error("useRequests must be used within RequestProvider");
  return ctx;
}
