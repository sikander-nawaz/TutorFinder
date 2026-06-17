"use client";
import { useState, useEffect, useCallback } from "react";
import { adminService } from "@/services/adminService";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ClipboardList,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  Search,
  Loader2,
  Clock,
  GraduationCap,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

type ReqStatus = "pending" | "approved" | "rejected" | "trial" | "completed";

interface AdminRequest {
  _id: string;
  studentId: string;
  tutorId: string;
  studentName: string;
  tutorName: string;
  subject: string;
  level: string;
  mode: string;
  message: string;
  status: ReqStatus;
  fee: number;
  createdAt: string;
  updatedAt: string;
}

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "trial", label: "In Trial" },
  { value: "completed", label: "Completed" },
  { value: "rejected", label: "Rejected" },
];

const statusConfig: Record<ReqStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  approved: { label: "Approved", color: "bg-blue-100 text-blue-700 border-blue-200", icon: CheckCircle },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
  trial: { label: "In Trial", color: "bg-purple-100 text-purple-700 border-purple-200", icon: GraduationCap },
  completed: { label: "Completed", color: "bg-primary/10 text-primary border-primary/20", icon: CheckCircle },
};

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
}

export default function AdminRequests() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<Record<string, string>>({});

  const [viewModal, setViewModal] = useState<AdminRequest | null>(null);
  const [deleteModal, setDeleteModal] = useState<AdminRequest | null>(null);
  const [rejectModal, setRejectModal] = useState<AdminRequest | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllRequests({
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: search.trim() || undefined,
      });
      setRequests(
        data.map((r: any) => ({ ...r, _id: (r._id || r.id)?.toString() }))
      );
    } catch {
      toast({ title: "Failed to load requests", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    const t = setTimeout(() => fetchRequests(), 300);
    return () => clearTimeout(t);
  }, [fetchRequests]);

  async function handleAccept(req: AdminRequest) {
    setActionLoading((p) => ({ ...p, [req._id]: "accept" }));
    try {
      await adminService.acceptRequest(req._id);
      setRequests((prev) =>
        prev.map((r) => (r._id === req._id ? { ...r, status: "approved" } : r))
      );
      toast({ title: `Request from ${req.studentName} accepted` });
    } catch {
      toast({ title: "Failed to accept request", variant: "destructive" });
    } finally {
      setActionLoading((p) => { const n = { ...p }; delete n[req._id]; return n; });
    }
  }

  async function handleReject(req: AdminRequest) {
    setActionLoading((p) => ({ ...p, [req._id]: "reject" }));
    try {
      await adminService.rejectRequest(req._id);
      setRequests((prev) =>
        prev.map((r) => (r._id === req._id ? { ...r, status: "rejected" } : r))
      );
      toast({ title: `Request from ${req.studentName} rejected` });
      setRejectModal(null);
    } catch {
      toast({ title: "Failed to reject request", variant: "destructive" });
    } finally {
      setActionLoading((p) => { const n = { ...p }; delete n[req._id]; return n; });
    }
  }

  async function handleDelete(req: AdminRequest) {
    setActionLoading((p) => ({ ...p, [req._id]: "delete" }));
    try {
      await adminService.deleteRequest(req._id);
      setRequests((prev) => prev.filter((r) => r._id !== req._id));
      toast({ title: "Request deleted" });
      setDeleteModal(null);
    } catch {
      toast({ title: "Failed to delete request", variant: "destructive" });
    } finally {
      setActionLoading((p) => { const n = { ...p }; delete n[req._id]; return n; });
    }
  }

  const counts = STATUS_OPTIONS.slice(1).map((s) => ({
    ...s,
    count: requests.filter((r) => r.status === s.value).length,
  }));

  return (
    <DashboardLayout title="All Requests">
      <div className="space-y-6">
        {/* Summary badges */}
        <div className="flex flex-wrap gap-3">
          {counts.map((s) => {
            const cfg = statusConfig[s.value as ReqStatus];
            const Icon = cfg.icon;
            return (
              <Badge
                key={s.value}
                className={`${cfg.color} border gap-1.5 py-1 px-3 cursor-pointer`}
                onClick={() => setStatusFilter(s.value)}
              >
                <Icon className="h-3.5 w-3.5" /> {s.count} {s.label}
              </Badge>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by student, tutor or subject…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={fetchRequests} title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Table / List */}
        {loading ? (
          <div className="space-y-3">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="h-8 w-8 text-primary" />
            </div>
            <p className="text-muted-foreground text-sm">No requests found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => {
              const cfg = statusConfig[req.status];
              const Icon = cfg.icon;
              const busy = !!actionLoading[req._id];
              return (
                <Card key={req._id}>
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* Avatar */}
                      <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0">
                        {initials(req.studentName)}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-sm">{req.studentName}</span>
                          <span className="text-muted-foreground text-xs">→</span>
                          <span className="font-medium text-sm">{req.tutorName}</span>
                          <Badge className={`text-xs border ${cfg.color} gap-1`}>
                            <Icon className="h-3 w-3" />
                            {cfg.label}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                          <span><strong>Subject:</strong> {req.subject}</span>
                          <span><strong>Level:</strong> {req.level}</span>
                          <span className="capitalize"><strong>Mode:</strong> {req.mode}</span>
                          <span><strong>Fee:</strong> Rs. {req.fee}/hr</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Submitted {format(new Date(req.createdAt), "MMM d, yyyy · h:mm a")}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1.5 text-xs"
                          onClick={() => setViewModal(req)}
                        >
                          <Eye className="h-3.5 w-3.5" /> View
                        </Button>
                        {req.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              className="h-8 gap-1.5 text-xs"
                              onClick={() => handleAccept(req)}
                              disabled={busy}
                            >
                              {actionLoading[req._id] === "accept" ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <CheckCircle className="h-3.5 w-3.5" />
                              )}
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 gap-1.5 text-xs text-destructive border-destructive/20 hover:bg-destructive/5"
                              onClick={() => setRejectModal(req)}
                              disabled={busy}
                            >
                              {actionLoading[req._id] === "reject" ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <XCircle className="h-3.5 w-3.5" />
                              )}
                              Reject
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1.5 text-xs text-destructive border-destructive/20 hover:bg-destructive/5"
                          onClick={() => setDeleteModal(req)}
                          disabled={busy}
                        >
                          {actionLoading[req._id] === "delete" ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* View Modal */}
      <Dialog open={!!viewModal} onOpenChange={() => setViewModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>
              {viewModal?.studentName} → {viewModal?.tutorName}
            </DialogDescription>
          </DialogHeader>
          {viewModal && (
            <div className="space-y-3 text-sm">
              <Row label="Student" value={viewModal.studentName} />
              <Row label="Tutor" value={viewModal.tutorName} />
              <Row label="Subject" value={viewModal.subject} />
              <Row label="Level" value={viewModal.level} />
              <Row label="Mode" value={viewModal.mode} />
              <Row label="Fee" value={`Rs. ${viewModal.fee}/hr`} />
              <Row label="Status" value={statusConfig[viewModal.status].label} />
              <Row
                label="Submitted"
                value={format(new Date(viewModal.createdAt), "PPP p")}
              />
              {viewModal.message && (
                <div className="pt-2 border-t border-border/50">
                  <p className="text-xs text-muted-foreground mb-1 font-medium">Message from student:</p>
                  <p className="text-sm bg-muted/40 rounded-lg p-3 leading-relaxed">
                    {viewModal.message}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2 mt-2">
            {viewModal?.status === "pending" && (
              <>
                <Button
                  className="gap-1.5"
                  onClick={() => { handleAccept(viewModal!); setViewModal(null); }}
                  disabled={!!actionLoading[viewModal?._id ?? ""]}
                >
                  <CheckCircle className="h-4 w-4" /> Accept
                </Button>
                <Button
                  variant="outline"
                  className="gap-1.5 text-destructive border-destructive/20"
                  onClick={() => { setRejectModal(viewModal); setViewModal(null); }}
                >
                  <XCircle className="h-4 w-4" /> Reject
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => setViewModal(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Confirm Modal */}
      <Dialog open={!!rejectModal} onOpenChange={() => setRejectModal(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
            <DialogDescription>
              Reject the request from <strong>{rejectModal?.studentName}</strong> to{" "}
              <strong>{rejectModal?.tutorName}</strong> for{" "}
              <strong>{rejectModal?.subject}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRejectModal(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => rejectModal && handleReject(rejectModal)}
              disabled={!!actionLoading[rejectModal?._id ?? ""]}
              className="gap-2"
            >
              {actionLoading[rejectModal?._id ?? ""] === "reject" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Modal */}
      <Dialog open={!!deleteModal} onOpenChange={() => setDeleteModal(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Request</DialogTitle>
            <DialogDescription>
              Permanently delete the request from{" "}
              <strong>{deleteModal?.studentName}</strong>? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteModal(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteModal && handleDelete(deleteModal)}
              disabled={!!actionLoading[deleteModal?._id ?? ""]}
              className="gap-2"
            >
              {actionLoading[deleteModal?._id ?? ""] === "delete" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-muted-foreground shrink-0 w-20">{label}:</span>
      <span className="font-medium capitalize">{value}</span>
    </div>
  );
}
