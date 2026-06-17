import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useRequests } from "@/context/RequestContext";
import { RequestStatus, TutorRequest } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Clock,
  CheckCircle,
  XCircle,
  GraduationCap,
  Loader2,
  ClipboardList,
  MessageCircle,
  Wifi,
  Home,
  MapPin,
  Link2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import Link from "next/link";

const statusConfig: Record<RequestStatus, { label: string; color: string }> = {
  pending: {
    label: "Pending",
    color: "bg-amber-100 text-amber-700 border-amber-200",
  },
  approved: {
    label: "Approved",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  rejected: {
    label: "Rejected",
    color: "bg-destructive/10 text-destructive border-destructive/20",
  },
  trial: {
    label: "In Trial",
    color: "bg-purple-100 text-purple-700 border-purple-200",
  },
  completed: {
    label: "Completed",
    color: "bg-primary/10 text-primary border-primary/20",
  },
};

const TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "trial", label: "In Trial" },
  { key: "completed", label: "Completed" },
  { key: "rejected", label: "Rejected" },
];

export default function ManageRequests() {
  const { requests, isLoading, fetchTutorRequests, updateStatus } =
    useRequests();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("pending");
  const [actionLoading, setActionLoading] = useState<Record<string, string>>(
    {},
  );
  const [meetingModal, setMeetingModal] = useState<TutorRequest | null>(null);
  const [meetingLink, setMeetingLink] = useState("");
  const [meetingLinkSaving, setMeetingLinkSaving] = useState(false);

  useEffect(() => {
    fetchTutorRequests();
  }, []);

  const filtered =
    activeTab === "all"
      ? requests || []
      : (requests || []).filter((r) => r.status === activeTab);

  const handleAction = async (
    id: string,
    status: RequestStatus,
    link?: string,
  ) => {
    setActionLoading((prev) => ({ ...prev, [id]: status }));
    try {
      await updateStatus(id, status, link);
    } finally {
      setActionLoading((prev) => {
        const p = { ...prev };
        delete p[id];
        return p;
      });
    }
  };

  const handleApprove = (req: TutorRequest) => {
    if (req.mode === "online") {
      setMeetingLink("");
      setMeetingModal(req);
    } else {
      handleAction(req.id, "approved");
    }
  };

  const handleMeetingConfirm = async () => {
    if (!meetingModal) return;
    if (!meetingLink.trim()) {
      toast({ title: "Please enter a meeting link", variant: "destructive" });
      return;
    }
    setMeetingLinkSaving(true);
    try {
      await handleAction(meetingModal.id, "approved", meetingLink.trim());
      setMeetingModal(null);
    } finally {
      setMeetingLinkSaving(false);
    }
  };

  return (
    <>
      <DashboardLayout title="Student Requests">
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.key
                    ? "bg-primary text-white shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
              >
                {tab.label}
                <span className="ml-1.5 text-xs opacity-70">
                  (
                  {
                    requests.filter((r) =>
                      tab.key === "all" ? true : r.status === tab.key,
                    ).length
                  }
                  )
                </span>
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-40 w-full rounded-xl" />
                ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <ClipboardList className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-1">No requests found</h3>
              <p className="text-muted-foreground text-sm">
                No {activeTab !== "all" ? activeTab : ""} requests at the
                moment.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((req) => {
                const cfg = statusConfig[req.status];
                const isLoading_ = (s: string) => actionLoading[req.id] === s;
                return (
                  <Card key={req.id} className="card-glow">
                    <CardContent className="p-5">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 font-bold text-sm flex items-center justify-center shrink-0">
                          {req.studentName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .substring(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-semibold">{req.studentName}</h3>
                            <Badge className={`text-xs border ${cfg.color}`}>
                              {cfg.label}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mb-2">
                            <span>{req.subject}</span>
                            <span>{req.level}</span>
                            <span className="capitalize flex items-center gap-1">
                              {req.mode === "online" ? (
                                <Wifi className="h-3.5 w-3.5" />
                              ) : (
                                <Home className="h-3.5 w-3.5" />
                              )}
                              {req.mode === "online"
                                ? "Online"
                                : "Home Tuition"}
                            </span>
                            <span className="font-medium text-foreground">
                              Rs. {req.fee}/hr
                            </span>
                          </div>
                          {req.selectedSlot && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-1.5 border border-border/50 w-fit mb-1">
                              <Clock className="h-3 w-3" />
                              <span className="font-medium">
                                {req.selectedSlot.day}
                              </span>
                              <span>
                                {req.selectedSlot.startTime} –{" "}
                                {req.selectedSlot.endTime}
                              </span>
                            </div>
                          )}
                          {req.mode === "home" && req.homeAddress && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 w-fit mb-1">
                              <MapPin className="h-3 w-3 text-amber-600" />
                              {req.status === "pending" ? (
                                <span className="text-amber-700">
                                  City: {req.homeAddress.city} (full address
                                  shown after acceptance)
                                </span>
                              ) : (
                                <span className="text-amber-700">
                                  {req.homeAddress.city} —{" "}
                                  {req.homeAddress.fullAddress}
                                </span>
                              )}
                            </div>
                          )}
                          {req.meetingLink && (
                            <div className="flex items-center gap-2 text-xs bg-primary/5 border border-primary/20 rounded-lg px-3 py-1.5 w-fit mb-1">
                              <Link2 className="h-3 w-3 text-primary" />
                              <a
                                href={req.meetingLink}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary hover:underline font-medium"
                              >
                                Join Meeting
                              </a>
                            </div>
                          )}
                          {req.message && (
                            <p className="text-sm bg-muted/40 border border-border/50 rounded-lg p-3 text-foreground/80">
                              {req.message}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            {format(
                              new Date(req.createdAt),
                              "MMM d, yyyy 'at' h:mm a",
                            )}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 shrink-0 min-w-[140px]">
                          {req.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                className="gap-1.5 w-full"
                                onClick={() => handleApprove(req)}
                                disabled={!!actionLoading[req.id]}
                              >
                                {isLoading_("approved") ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-3.5 w-3.5" />
                                )}
                                {req.mode === "online"
                                  ? "Approve + Set Link"
                                  : "Approve"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1.5 w-full text-destructive hover:text-destructive border-destructive/20 hover:bg-destructive/5"
                                onClick={() => handleAction(req.id, "rejected")}
                                disabled={!!actionLoading[req.id]}
                              >
                                {isLoading_("rejected") ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <XCircle className="h-3.5 w-3.5" />
                                )}
                                Reject
                              </Button>
                            </>
                          )}
                          {req.status === "approved" && (
                            <>
                              <Button
                                size="sm"
                                className="gap-1.5 w-full bg-purple-600 hover:bg-purple-700"
                                onClick={() => handleAction(req.id, "trial")}
                                disabled={!!actionLoading[req.id]}
                              >
                                {isLoading_("trial") ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <GraduationCap className="h-3.5 w-3.5" />
                                )}
                                Start Trial
                              </Button>
                            </>
                          )}
                          {req.status === "trial" && (
                            <Button
                              size="sm"
                              className="gap-1.5 w-full"
                              onClick={() => handleAction(req.id, "completed")}
                              disabled={!!actionLoading[req.id]}
                            >
                              {isLoading_("completed") ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <CheckCircle className="h-3.5 w-3.5" />
                              )}
                              Mark Complete
                            </Button>
                          )}
                          <Link href="/chat">
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1.5 w-full"
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                              Message
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </DashboardLayout>

      {/* Meeting Link Modal */}
      <Dialog open={!!meetingModal} onOpenChange={() => setMeetingModal(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wifi className="h-5 w-5 text-primary" /> Online Session — Meeting
              Link
            </DialogTitle>
            <DialogDescription>
              Provide a Google Meet or Zoom link for{" "}
              <strong>{meetingModal?.studentName}</strong>'s session.
            </DialogDescription>
          </DialogHeader>
          {meetingModal?.selectedSlot && (
            <div className="flex items-center gap-2 text-sm bg-muted/40 rounded-lg px-3 py-2 border">
              <Clock className="h-4 w-4 text-primary" />
              <span className="font-medium">
                {meetingModal.selectedSlot.day}
              </span>
              <span className="text-muted-foreground">
                {meetingModal.selectedSlot.startTime} –{" "}
                {meetingModal.selectedSlot.endTime}
              </span>
            </div>
          )}
          <div className="space-y-2">
            <Label>Meeting Link</Label>
            <Input
              placeholder="https://meet.google.com/... or https://zoom.us/j/..."
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setMeetingModal(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleMeetingConfirm}
              disabled={meetingLinkSaving}
              className="gap-2"
            >
              {meetingLinkSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Confirm & Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
