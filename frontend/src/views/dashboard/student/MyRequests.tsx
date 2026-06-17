import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useRequests } from "@/context/RequestContext";
import { TutorRequest, RequestStatus } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Clock,
  CheckCircle,
  XCircle,
  GraduationCap,
  Trash2,
  Edit3,
  Loader2,
  ClipboardList,
  Phone,
  ShieldAlert,
  Star,
  Wifi,
  Home,
  MapPin,
  Link2,
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

const STATUS_TABS: { key: string; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "trial", label: "In Trial" },
  { key: "completed", label: "Completed" },
  { key: "rejected", label: "Rejected" },
];

const statusConfig: Record<
  RequestStatus,
  { label: string; color: string; icon: React.ElementType }
> = {
  pending: {
    label: "Pending",
    color: "bg-amber-100 text-amber-700 border-amber-200",
    icon: Clock,
  },
  approved: {
    label: "Approved",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: CheckCircle,
  },
  rejected: {
    label: "Rejected",
    color: "bg-destructive/10 text-destructive border-destructive/20",
    icon: XCircle,
  },
  trial: {
    label: "In Trial",
    color: "bg-purple-100 text-purple-700 border-purple-200",
    icon: GraduationCap,
  },
  completed: {
    label: "Completed",
    color: "bg-primary/10 text-primary border-primary/20",
    icon: CheckCircle,
  },
};

export default function MyRequests() {
  const {
    requests,
    isLoading,
    fetchStudentRequests,
    editRequest,
    deleteRequest,
  } = useRequests();
  const [activeTab, setActiveTab] = useState("all");
  const [editingRequest, setEditingRequest] = useState<TutorRequest | null>(
    null,
  );
  const [editForm, setEditForm] = useState({ message: "", fee: 0 });
  const [editLoading, setEditLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [reviewRequest, setReviewRequest] = useState<TutorRequest | null>(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewLoading, setReviewLoading] = useState(false);
  const { toast } = useToast();

  const phoneVerified =
    typeof window !== "undefined"
      ? localStorage.getItem("student_phone_verified") === "true"
      : false;

  useEffect(() => {
    fetchStudentRequests();
  }, []);

  const filtered =
    activeTab === "all"
      ? requests
      : requests.filter((r) => r.status === activeTab);

  const handleEdit = (req: TutorRequest) => {
    setEditingRequest(req);
    setEditForm({ message: req.message, fee: req.fee });
  };

  const handleEditSave = async () => {
    if (!editingRequest) return;
    setEditLoading(true);
    try {
      await editRequest(editingRequest.id, editForm);
      setEditingRequest(null);
    } catch {
      toast({ title: "Failed to update request", variant: "destructive" });
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteRequest(id);
    } catch {
      toast({ title: "Failed to delete request", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  const handleReviewSave = async () => {
    if (!reviewRequest) return;
    setReviewLoading(true);
    try {
      const { reviewService } = await import("@/services/reviewService");
      await reviewService.createReview({
        requestId: reviewRequest.id,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      toast({ title: "Review submitted! Thank you." });
      setReviewRequest(null);
    } catch {
      toast({ title: "Failed to submit review", variant: "destructive" });
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <DashboardLayout title="My Requests">
      <div className="space-y-6">
        {/* Phone verification gate */}
        {!phoneVerified && (
          <div className="flex items-start gap-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
              <Phone className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <ShieldAlert className="h-4 w-4 text-amber-600" />
                <p className="font-semibold text-amber-800 text-sm">
                  Phone verification required before booking
                </p>
              </div>
              <p className="text-xs text-amber-700 leading-relaxed mb-3">
                Verify your phone number to confirm you're a real person. This
                one-time step unlocks the ability to send requests to tutors.
              </p>
              <Link href="/dashboard/student/verification">
                <Button
                  size="sm"
                  className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5 h-8 text-xs"
                >
                  <Phone className="h-3.5 w-3.5" /> Verify My Phone Now
                </Button>
              </Link>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => (
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
              {tab.key !== "all" && (
                <span className="ml-1.5 text-xs opacity-70">
                  ({requests.filter((r) => r.status === tab.key).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
              ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-1">No requests found</h3>
            <p className="text-muted-foreground text-sm">
              You don't have any {activeTab !== "all" ? activeTab : ""} requests
              yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((req) => {
              const cfg = statusConfig[req.status];
              const Icon = cfg.icon;
              const canEdit = req.status === "pending";
              return (
                <Card key={req.id} className="card-glow">
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0">
                        {req.tutorName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-semibold">{req.tutorName}</h3>
                          <Badge
                            className={`text-xs border ${cfg.color} gap-1`}
                          >
                            <Icon className="h-3 w-3" />
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
                            {req.mode === "online" ? "Online" : "Home Tuition"}
                          </span>
                          <span>Rs. {req.fee}/hr</span>
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
                        {req.meetingLink && req.status !== "pending" && (
                          <div className="flex items-center gap-2 text-xs bg-primary/5 border border-primary/20 rounded-lg px-3 py-1.5 w-fit mb-1">
                            <Link2 className="h-3 w-3 text-primary" />
                            <a
                              href={req.meetingLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary hover:underline font-medium"
                            >
                              Join Online Meeting
                            </a>
                          </div>
                        )}
                        {req.mode === "home" &&
                          req.homeAddress &&
                          req.status !== "pending" && (
                            <div className="flex items-center gap-2 text-xs bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 w-fit mb-1">
                              <MapPin className="h-3 w-3 text-amber-600" />
                              <span className="text-amber-700">
                                {req.status === "approved" ||
                                req.status === "trial" ||
                                req.status === "completed"
                                  ? `${req.homeAddress.city} — ${req.homeAddress.fullAddress}`
                                  : `City: ${req.homeAddress.city}`}
                              </span>
                            </div>
                          )}
                        {req.message && (
                          <p className="text-sm text-foreground/80 bg-muted/40 rounded-lg p-3 border border-border/50">
                            {req.message}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          Sent {format(new Date(req.createdAt), "MMM d, yyyy")}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {canEdit && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5"
                              onClick={() => handleEdit(req)}
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5 text-destructive hover:text-destructive border-destructive/20 hover:bg-destructive/5"
                              onClick={() => handleDelete(req.id)}
                              disabled={deletingId === req.id}
                            >
                              {deletingId === req.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                              Delete
                            </Button>
                          </>
                        )}
                        {req.status === "completed" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 text-amber-600 border-amber-200 hover:bg-amber-50"
                            onClick={() => {
                              setReviewRequest(req);
                              setReviewForm({ rating: 5, comment: "" });
                            }}
                          >
                            <Star className="h-3.5 w-3.5" />
                            Review
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Dialog */}
      <Dialog
        open={!!reviewRequest}
        onOpenChange={() => setReviewRequest(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Leave a Review for {reviewRequest?.tutorName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() =>
                      setReviewForm((f) => ({ ...f, rating: star }))
                    }
                    className="p-0.5"
                  >
                    <Star
                      className={`h-7 w-7 transition-colors ${
                        star <= reviewForm.rating
                          ? "text-amber-400 fill-amber-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Comment (optional)</Label>
              <Textarea
                rows={3}
                value={reviewForm.comment}
                onChange={(e) =>
                  setReviewForm((f) => ({ ...f, comment: e.target.value }))
                }
                placeholder="Share your experience..."
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setReviewRequest(null)}>
                Cancel
              </Button>
              <Button onClick={handleReviewSave} disabled={reviewLoading}>
                {reviewLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Review"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editingRequest}
        onOpenChange={() => setEditingRequest(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Proposed Fee (Rs./hr)</Label>
              <Input
                type="number"
                value={editForm.fee}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, fee: +e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                rows={4}
                value={editForm.message}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, message: e.target.value }))
                }
                placeholder="Any special requirements or notes..."
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setEditingRequest(null)}>
                Cancel
              </Button>
              <Button onClick={handleEditSave} disabled={editLoading}>
                {editLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
