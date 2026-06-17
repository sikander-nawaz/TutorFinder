"use client";
import { useState, useEffect } from "react";
import { adminService } from "@/services/adminService";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  ShieldCheck,
  MapPin,
  CheckCircle,
  XCircle,
  Video,
  FileText,
  Calendar,
  Link as LinkIcon,
  Clock,
  AlertCircle,
  Eye,
  RefreshCw,
  Loader2,
  GraduationCap,
  Users,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type AppStatus =
  | "documents_submitted"
  | "interview_scheduled"
  | "reapplication";
type StudentAppStatus = "pending_review" | "reapplication";

interface Document {
  label: string;
  type: string;
  submitted: boolean;
  url?: string | null;
}

interface Application {
  id: string;
  name: string;
  email: string;
  city: string;
  cnic: string;
  subjects: string[];
  level: string;
  experience: number;
  hourlyRate: number;
  qualification: string;
  status: AppStatus;
  submittedAt: string;
  documents: Document[];
  interviewLink?: string;
  interviewPlatform?: string;
  interviewDate?: string;
  interviewTime?: string;
  rejectionReason?: string;
  rejectedAt?: string;
}

interface StudentDoc {
  label: string;
  type: string;
  submitted: boolean;
  url?: string | null;
}

interface StudentApplication {
  id: string;
  name: string;
  email: string;
  city: string;
  cnic: string;
  classLevel: string;
  institution: string;
  status: StudentAppStatus;
  submittedAt: string;
  documents: StudentDoc[];
  rejectionReason?: string;
  rejectedAt?: string;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2);
}

export default function TutorVerification() {
  const { toast } = useToast();

  /* ── Tutor state ── */
  const [apps, setApps] = useState<Application[]>([]);
  const [appsLoading, setAppsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<string, string>>(
    {},
  );

  useEffect(() => {
    adminService
      .getPendingTutors?.()
      .then((data: Application[]) => setApps(data))
      .catch(() => setApps([]))
      .finally(() => setAppsLoading(false));
  }, []);

  const [scheduleModal, setScheduleModal] = useState<Application | null>(null);
  const [rejectModal, setRejectModal] = useState<Application | null>(null);
  const [approveModal, setApproveModal] = useState<Application | null>(null);
  const [docsModal, setDocsModal] = useState<Application | null>(null);

  const [scheduleForm, setScheduleForm] = useState({
    platform: "Zoom",
    link: "",
    date: "",
    time: "",
  });
  const [rejectReason, setRejectReason] = useState("");

  const pending = apps.filter((a) => a.status === "documents_submitted");
  const interviews = apps.filter((a) => a.status === "interview_scheduled");
  const reapps = apps.filter((a) => a.status === "reapplication");

  /* ── Student state ── */
  const [studentApps, setStudentApps] = useState<StudentApplication[]>([]);
  const [studentAppsLoading, setStudentAppsLoading] = useState(true);
  const [studentActionLoading, setStudentActionLoading] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    adminService
      .getPendingStudents()
      .then((data: StudentApplication[]) => setStudentApps(data))
      .catch(() => setStudentApps([]))
      .finally(() => setStudentAppsLoading(false));
  }, []);
  const [studentRejectModal, setStudentRejectModal] =
    useState<StudentApplication | null>(null);
  const [studentApproveModal, setStudentApproveModal] =
    useState<StudentApplication | null>(null);
  const [studentDocsModal, setStudentDocsModal] =
    useState<StudentApplication | null>(null);
  const [studentRejectReason, setStudentRejectReason] = useState("");

  const studentPending = studentApps.filter(
    (a) => a.status === "pending_review",
  );
  const studentReapps = studentApps.filter((a) => a.status === "reapplication");

  async function handleSchedule() {
    if (!scheduleModal) return;
    if (!scheduleForm.link || !scheduleForm.date || !scheduleForm.time) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setActionLoading((p) => ({ ...p, [scheduleModal.id]: "schedule" }));
    try {
      await adminService.scheduleInterview(scheduleModal.id, {
        interviewLink: scheduleForm.link,
        interviewDate: `${scheduleForm.date}T${scheduleForm.time}`,
      });
      setApps((prev) =>
        prev.map((a) =>
          a.id === scheduleModal!.id
            ? {
                ...a,
                status: "interview_scheduled",
                interviewLink: scheduleForm.link,
                interviewPlatform: scheduleForm.platform,
                interviewDate: scheduleForm.date,
                interviewTime: scheduleForm.time,
              }
            : a,
        ),
      );
      toast({
        title: "Interview scheduled",
        description: `${scheduleModal!.name} has been notified.`,
      });
      setScheduleModal(null);
      setScheduleForm({ platform: "Zoom", link: "", date: "", time: "" });
    } catch {
      toast({ title: "Failed to schedule interview", variant: "destructive" });
    } finally {
      setActionLoading((p) => {
        const n = { ...p };
        delete n[scheduleModal!.id];
        return n;
      });
    }
  }

  async function handleReject() {
    if (!rejectModal) return;
    if (!rejectReason.trim()) {
      toast({
        title: "Please provide a rejection reason",
        variant: "destructive",
      });
      return;
    }
    setActionLoading((p) => ({ ...p, [rejectModal.id]: "reject" }));
    try {
      await adminService.rejectTutor(rejectModal.id, rejectReason);
      setApps((prev) => prev.filter((a) => a.id !== rejectModal!.id));
      toast({
        title: "Application rejected",
        description: `${rejectModal!.name} has been notified with the reason.`,
      });
      setRejectModal(null);
      setRejectReason("");
    } catch {
      toast({ title: "Failed to reject application", variant: "destructive" });
    } finally {
      setActionLoading((p) => {
        const n = { ...p };
        delete n[rejectModal!.id];
        return n;
      });
    }
  }

  async function handleApprove() {
    if (!approveModal) return;
    setActionLoading((p) => ({ ...p, [approveModal.id]: "approve" }));
    try {
      await adminService.approveTutor(approveModal.id);
      setApps((prev) => prev.filter((a) => a.id !== approveModal!.id));
      toast({ title: `${approveModal!.name} is now a verified tutor!` });
      setApproveModal(null);
    } catch {
      toast({ title: "Failed to approve tutor", variant: "destructive" });
    } finally {
      setActionLoading((p) => {
        const n = { ...p };
        delete n[approveModal!.id];
        return n;
      });
    }
  }

  /* ── Student actions ── */
  async function handleStudentApprove() {
    if (!studentApproveModal) return;
    setStudentActionLoading((p) => ({
      ...p,
      [studentApproveModal.id]: "approve",
    }));
    try {
      await adminService.approveStudent(studentApproveModal.id);
      setStudentApps((prev) =>
        prev.filter((a) => a.id !== studentApproveModal!.id),
      );
      toast({
        title: `${studentApproveModal!.name} is now a verified student!`,
      });
      setStudentApproveModal(null);
    } catch {
      toast({ title: "Failed to approve student", variant: "destructive" });
    } finally {
      setStudentActionLoading((p) => {
        const n = { ...p };
        delete n[studentApproveModal!.id];
        return n;
      });
    }
  }

  async function handleStudentReject() {
    if (!studentRejectModal) return;
    if (!studentRejectReason.trim()) {
      toast({
        title: "Please provide a rejection reason",
        variant: "destructive",
      });
      return;
    }
    setStudentActionLoading((p) => ({
      ...p,
      [studentRejectModal.id]: "reject",
    }));
    try {
      await adminService.rejectStudent(
        studentRejectModal.id,
        studentRejectReason,
      );
      setStudentApps((prev) =>
        prev.filter((a) => a.id !== studentRejectModal!.id),
      );
      toast({
        title: "Student application rejected",
        description: `${studentRejectModal!.name} has been notified.`,
      });
      setStudentRejectModal(null);
      setStudentRejectReason("");
    } catch {
      toast({ title: "Failed to reject student", variant: "destructive" });
    } finally {
      setStudentActionLoading((p) => {
        const n = { ...p };
        delete n[studentRejectModal!.id];
        return n;
      });
    }
  }

  return (
    <DashboardLayout title="Verifications">
      <div className="space-y-6">
        <Tabs defaultValue="tutors">
          {/* ── Role Selector ── */}
          <TabsList className="h-11 mb-6 w-full sm:w-auto">
            <TabsTrigger
              value="tutors"
              className="gap-2 flex-1 sm:flex-initial"
            >
              <ShieldCheck className="h-4 w-4" />
              Tutor Verifications
              {pending.length + interviews.length + reapps.length > 0 && (
                <Badge className="h-5 px-1.5 text-xs bg-amber-500/20 text-amber-700 border-0">
                  {pending.length + interviews.length + reapps.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="students"
              className="gap-2 flex-1 sm:flex-initial"
            >
              <GraduationCap className="h-4 w-4" />
              Student Verifications
              {studentPending.length + studentReapps.length > 0 && (
                <Badge className="h-5 px-1.5 text-xs bg-blue-500/20 text-blue-700 border-0">
                  {studentPending.length + studentReapps.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ════ TUTOR VERIFICATIONS ════ */}
          <TabsContent value="tutors" className="space-y-6">
            <div className="flex flex-wrap gap-3">
              <Badge className="bg-amber-100 text-amber-700 border-amber-200 border gap-1.5 py-1 px-3">
                <Clock className="h-3.5 w-3.5" /> {pending.length} Pending
                Review
              </Badge>
              <Badge className="bg-blue-100 text-blue-700 border-blue-200 border gap-1.5 py-1 px-3">
                <Video className="h-3.5 w-3.5" /> {interviews.length} Interview
                Stage
              </Badge>
              <Badge className="bg-purple-100 text-purple-700 border-purple-200 border gap-1.5 py-1 px-3">
                <RefreshCw className="h-3.5 w-3.5" /> {reapps.length}{" "}
                Reapplication{reapps.length !== 1 ? "s" : ""}
              </Badge>
            </div>

            <Tabs defaultValue="pending">
              <TabsList className="h-10 mb-4">
                <TabsTrigger value="pending" className="gap-2 text-sm">
                  Documents Review
                  {pending.length > 0 && (
                    <Badge className="h-5 px-1.5 text-xs bg-amber-500/20 text-amber-700 border-0">
                      {pending.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="interview" className="gap-2 text-sm">
                  Interview Stage
                  {interviews.length > 0 && (
                    <Badge className="h-5 px-1.5 text-xs bg-blue-500/20 text-blue-700 border-0">
                      {interviews.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="reapplication" className="gap-2 text-sm">
                  Reapplications
                  {reapps.length > 0 && (
                    <Badge className="h-5 px-1.5 text-xs bg-purple-500/20 text-purple-700 border-0">
                      {reapps.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* ── Tab 1: Pending Documents Review ── */}
              <TabsContent value="pending">
                <EmptyOrGrid
                  items={pending}
                  message="No pending document reviews."
                  icon={<ShieldCheck className="h-8 w-8 text-primary" />}
                >
                  {pending.map((app) => (
                    <AppCard
                      key={app.id}
                      app={app}
                      actionLoading={actionLoading}
                    >
                      <DocumentsRow
                        app={app}
                        onView={() => setDocsModal(app)}
                      />
                      <div className="flex gap-2 pt-4 border-t border-border/50">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 gap-1.5"
                          onClick={() => setScheduleModal(app)}
                          disabled={!!actionLoading[app.id]}
                        >
                          {actionLoading[app.id] === "schedule" ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Calendar className="h-3.5 w-3.5" />
                          )}
                          Schedule Interview
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 text-destructive hover:bg-destructive/5 border-destructive/20"
                          onClick={() => setRejectModal(app)}
                          disabled={!!actionLoading[app.id]}
                        >
                          {actionLoading[app.id] === "reject" ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5" />
                          )}
                          Reject
                        </Button>
                      </div>
                    </AppCard>
                  ))}
                </EmptyOrGrid>
              </TabsContent>

              {/* ── Tab 2: Interview Stage ── */}
              <TabsContent value="interview">
                <EmptyOrGrid
                  items={interviews}
                  message="No tutors in interview stage."
                  icon={<Video className="h-8 w-8 text-primary" />}
                >
                  {interviews.map((app) => (
                    <AppCard
                      key={app.id}
                      app={app}
                      actionLoading={actionLoading}
                    >
                      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200/50 rounded-xl p-3 mb-3 space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Video className="h-4 w-4 text-blue-600 shrink-0" />
                          <span className="font-semibold text-blue-700 dark:text-blue-400">
                            {app.interviewPlatform} Interview
                          </span>
                        </div>
                        <div className="text-muted-foreground text-xs space-y-1 pl-6">
                          <p>
                            📅 {app.interviewDate} at {app.interviewTime}
                          </p>
                          <p className="truncate">🔗 {app.interviewLink}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-4 border-t border-border/50">
                        <Button
                          size="sm"
                          className="flex-1 gap-1.5"
                          onClick={() => setApproveModal(app)}
                          disabled={!!actionLoading[app.id]}
                        >
                          {actionLoading[app.id] === "approve" ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <CheckCircle className="h-3.5 w-3.5" />
                          )}
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 text-destructive hover:bg-destructive/5 border-destructive/20"
                          onClick={() => setRejectModal(app)}
                          disabled={!!actionLoading[app.id]}
                        >
                          {actionLoading[app.id] === "reject" ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5" />
                          )}
                          Reject
                        </Button>
                      </div>
                    </AppCard>
                  ))}
                </EmptyOrGrid>
              </TabsContent>

              {/* ── Tab 3: Reapplications ── */}
              <TabsContent value="reapplication">
                <EmptyOrGrid
                  items={reapps}
                  message="No reapplication requests."
                  icon={<RefreshCw className="h-8 w-8 text-primary" />}
                >
                  {reapps.map((app) => (
                    <AppCard
                      key={app.id}
                      app={app}
                      actionLoading={actionLoading}
                    >
                      <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-3 mb-3 text-sm">
                        <p className="text-xs font-semibold text-destructive mb-1">
                          Previous rejection reason:
                        </p>
                        <p className="text-muted-foreground text-xs leading-relaxed">
                          "{app.rejectionReason}"
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Rejected on {app.rejectedAt}
                        </p>
                      </div>
                      <DocumentsRow
                        app={app}
                        onView={() => setDocsModal(app)}
                      />
                      <div className="flex gap-2 pt-4 border-t border-border/50">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 gap-1.5"
                          onClick={() => setScheduleModal(app)}
                          disabled={!!actionLoading[app.id]}
                        >
                          <Calendar className="h-3.5 w-3.5" /> Schedule
                          Interview
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 text-destructive hover:bg-destructive/5 border-destructive/20"
                          onClick={() => setRejectModal(app)}
                          disabled={!!actionLoading[app.id]}
                        >
                          <XCircle className="h-3.5 w-3.5" /> Reject Again
                        </Button>
                      </div>
                    </AppCard>
                  ))}
                </EmptyOrGrid>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* ════ STUDENT VERIFICATIONS ════ */}
          <TabsContent value="students" className="space-y-6">
            <div className="flex flex-wrap gap-3">
              <Badge className="bg-amber-100 text-amber-700 border-amber-200 border gap-1.5 py-1 px-3">
                <Clock className="h-3.5 w-3.5" /> {studentPending.length}{" "}
                Pending Review
              </Badge>
              <Badge className="bg-purple-100 text-purple-700 border-purple-200 border gap-1.5 py-1 px-3">
                <RefreshCw className="h-3.5 w-3.5" /> {studentReapps.length}{" "}
                Reapplication{studentReapps.length !== 1 ? "s" : ""}
              </Badge>
            </div>

            <Tabs defaultValue="student-pending">
              <TabsList className="h-10 mb-4">
                <TabsTrigger value="student-pending" className="gap-2 text-sm">
                  Pending Review
                  {studentPending.length > 0 && (
                    <Badge className="h-5 px-1.5 text-xs bg-amber-500/20 text-amber-700 border-0">
                      {studentPending.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="student-reapplication"
                  className="gap-2 text-sm"
                >
                  Reapplications
                  {studentReapps.length > 0 && (
                    <Badge className="h-5 px-1.5 text-xs bg-purple-500/20 text-purple-700 border-0">
                      {studentReapps.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Student Tab 1: Pending Review */}
              <TabsContent value="student-pending">
                <StudentEmptyOrGrid
                  items={studentPending}
                  message="No pending student verifications."
                  icon={<Users className="h-8 w-8 text-primary" />}
                >
                  {studentPending.map((app) => (
                    <StudentAppCard
                      key={app.id}
                      app={app}
                      actionLoading={studentActionLoading}
                    >
                      <StudentDocsRow
                        app={app}
                        onView={() => setStudentDocsModal(app)}
                      />
                      <div className="flex gap-2 pt-4 border-t border-border/50">
                        <Button
                          size="sm"
                          className="flex-1 gap-1.5"
                          onClick={() => setStudentApproveModal(app)}
                          disabled={!!studentActionLoading[app.id]}
                        >
                          {studentActionLoading[app.id] === "approve" ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <CheckCircle className="h-3.5 w-3.5" />
                          )}
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 text-destructive hover:bg-destructive/5 border-destructive/20"
                          onClick={() => setStudentRejectModal(app)}
                          disabled={!!studentActionLoading[app.id]}
                        >
                          {studentActionLoading[app.id] === "reject" ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5" />
                          )}
                          Reject
                        </Button>
                      </div>
                    </StudentAppCard>
                  ))}
                </StudentEmptyOrGrid>
              </TabsContent>

              {/* Student Tab 2: Reapplications */}
              <TabsContent value="student-reapplication">
                <StudentEmptyOrGrid
                  items={studentReapps}
                  message="No student reapplications."
                  icon={<RefreshCw className="h-8 w-8 text-primary" />}
                >
                  {studentReapps.map((app) => (
                    <StudentAppCard
                      key={app.id}
                      app={app}
                      actionLoading={studentActionLoading}
                    >
                      <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-3 mb-3 text-sm">
                        <p className="text-xs font-semibold text-destructive mb-1">
                          Previous rejection reason:
                        </p>
                        <p className="text-muted-foreground text-xs leading-relaxed">
                          "{app.rejectionReason}"
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Rejected on {app.rejectedAt}
                        </p>
                      </div>
                      <StudentDocsRow
                        app={app}
                        onView={() => setStudentDocsModal(app)}
                      />
                      <div className="flex gap-2 pt-4 border-t border-border/50">
                        <Button
                          size="sm"
                          className="flex-1 gap-1.5"
                          onClick={() => setStudentApproveModal(app)}
                          disabled={!!studentActionLoading[app.id]}
                        >
                          {studentActionLoading[app.id] === "approve" ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <CheckCircle className="h-3.5 w-3.5" />
                          )}
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 text-destructive hover:bg-destructive/5 border-destructive/20"
                          onClick={() => setStudentRejectModal(app)}
                          disabled={!!studentActionLoading[app.id]}
                        >
                          {studentActionLoading[app.id] === "reject" ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5" />
                          )}
                          Reject Again
                        </Button>
                      </div>
                    </StudentAppCard>
                  ))}
                </StudentEmptyOrGrid>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Schedule Interview Modal ── */}
      <Dialog
        open={!!scheduleModal}
        onOpenChange={() => {
          setScheduleModal(null);
          setScheduleForm({ platform: "Zoom", link: "", date: "", time: "" });
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Interview</DialogTitle>
            <DialogDescription>
              Set up a Zoom or Google Meet interview for {scheduleModal?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Platform</Label>
              <div className="grid grid-cols-2 gap-2">
                {["Zoom", "Google Meet"].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() =>
                      setScheduleForm((f) => ({ ...f, platform: p }))
                    }
                    className={cn(
                      "flex items-center justify-center gap-2 h-10 rounded-lg border-2 text-sm font-medium transition-all",
                      scheduleForm.platform === p
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40",
                    )}
                  >
                    <Video className="h-4 w-4" /> {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="meet-link">
                Meeting Link <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="meet-link"
                  placeholder={
                    scheduleForm.platform === "Zoom"
                      ? "https://zoom.us/j/..."
                      : "https://meet.google.com/..."
                  }
                  className="pl-9"
                  value={scheduleForm.link}
                  onChange={(e) =>
                    setScheduleForm((f) => ({ ...f, link: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="interview-date">
                  Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="interview-date"
                  type="date"
                  value={scheduleForm.date}
                  onChange={(e) =>
                    setScheduleForm((f) => ({ ...f, date: e.target.value }))
                  }
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interview-time">
                  Time <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="interview-time"
                  type="time"
                  value={scheduleForm.time}
                  onChange={(e) =>
                    setScheduleForm((f) => ({ ...f, time: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="flex items-start gap-2 text-xs text-muted-foreground p-3 bg-muted/40 rounded-lg">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-500" />
              The tutor will receive this meeting link and schedule in their
              dashboard.
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setScheduleModal(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleSchedule}
              disabled={!!actionLoading[scheduleModal?.id ?? -1]}
              className="gap-2"
            >
              {actionLoading[scheduleModal?.id ?? -1] === "schedule" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Calendar className="h-4 w-4" />
              )}
              Send to Tutor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Reject Modal ── */}
      <Dialog
        open={!!rejectModal}
        onOpenChange={() => {
          setRejectModal(null);
          setRejectReason("");
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Provide a clear reason so {rejectModal?.name} knows what to fix
              before reapplying.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reject-reason">
                Rejection Reason <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="reject-reason"
                rows={4}
                placeholder="e.g. Your degree certificate was not clearly legible. Please resubmit with a high-resolution scan..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                The tutor can reapply after 15 days from the rejection date.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setRejectModal(null);
                setRejectReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={
                !!actionLoading[rejectModal?.id ?? -1] || !rejectReason.trim()
              }
              className="gap-2"
            >
              {actionLoading[rejectModal?.id ?? -1] === "reject" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              Reject Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Approve Modal ── */}
      <Dialog open={!!approveModal} onOpenChange={() => setApproveModal(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Approve Tutor</DialogTitle>
            <DialogDescription>
              Approve <strong>{approveModal?.name}</strong> as a verified tutor?
              Their profile will go live and be visible to students.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setApproveModal(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              disabled={!!actionLoading[approveModal?.id ?? -1]}
              className="gap-2 bg-primary"
            >
              {actionLoading[approveModal?.id ?? -1] === "approve" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Approve & Verify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Documents Modal ── */}
      <Dialog open={!!docsModal} onOpenChange={() => setDocsModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Submitted Documents</DialogTitle>
            <DialogDescription>
              {docsModal?.name} — CNIC: {docsModal?.cnic}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {docsModal?.documents.map((doc) => (
              <div
                key={doc.type}
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl border",
                  doc.submitted
                    ? "border-border/60 bg-muted/30"
                    : "border-dashed border-border/40 bg-muted/10 opacity-60",
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      doc.submitted ? "bg-primary/10" : "bg-muted",
                    )}
                  >
                    <FileText
                      className={cn(
                        "h-4 w-4",
                        doc.submitted
                          ? "text-primary"
                          : "text-muted-foreground",
                      )}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{doc.label}</p>
                    {!doc.submitted && (
                      <p className="text-xs text-muted-foreground">
                        Not submitted
                      </p>
                    )}
                  </div>
                </div>
                {doc.submitted && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-xs h-7"
                    onClick={() => {
                      if (doc.url) {
                        window.open(doc.url, "_blank", "noopener,noreferrer");
                      } else {
                        toast({
                          title: "No URL available for this document",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    <Eye className="h-3 w-3" /> View
                  </Button>
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDocsModal(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Student Approve Modal ── */}
      <Dialog
        open={!!studentApproveModal}
        onOpenChange={() => setStudentApproveModal(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Approve Student</DialogTitle>
            <DialogDescription>
              Approve <strong>{studentApproveModal?.name}</strong> as a verified
              student? They will be able to book tutors and access all features.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setStudentApproveModal(null)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStudentApprove}
              disabled={!!studentActionLoading[studentApproveModal?.id ?? -1]}
              className="gap-2 bg-primary"
            >
              {studentActionLoading[studentApproveModal?.id ?? -1] ===
              "approve" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Approve & Verify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Student Reject Modal ── */}
      <Dialog
        open={!!studentRejectModal}
        onOpenChange={() => {
          setStudentRejectModal(null);
          setStudentRejectReason("");
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Student Verification</DialogTitle>
            <DialogDescription>
              Provide a clear reason so {studentRejectModal?.name} knows what to
              fix before reapplying.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student-reject-reason">
                Rejection Reason <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="student-reject-reason"
                rows={4}
                placeholder="e.g. Domicile certificate appears expired. Please upload a valid, current copy..."
                value={studentRejectReason}
                onChange={(e) => setStudentRejectReason(e.target.value)}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                The student can reapply after 15 days from the rejection date.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setStudentRejectModal(null);
                setStudentRejectReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleStudentReject}
              disabled={
                !!studentActionLoading[studentRejectModal?.id ?? -1] ||
                !studentRejectReason.trim()
              }
              className="gap-2"
            >
              {studentActionLoading[studentRejectModal?.id ?? -1] ===
              "reject" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              Reject Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Student Docs Modal ── */}
      <Dialog
        open={!!studentDocsModal}
        onOpenChange={() => setStudentDocsModal(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Submitted Documents</DialogTitle>
            <DialogDescription>
              {studentDocsModal?.name} — CNIC: {studentDocsModal?.cnic}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {studentDocsModal?.documents.map((doc) => (
              <div
                key={doc.type}
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl border",
                  doc.submitted
                    ? "border-border/60 bg-muted/30"
                    : "border-dashed border-border/40 bg-muted/10 opacity-60",
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      doc.submitted ? "bg-primary/10" : "bg-muted",
                    )}
                  >
                    <FileText
                      className={cn(
                        "h-4 w-4",
                        doc.submitted
                          ? "text-primary"
                          : "text-muted-foreground",
                      )}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{doc.label}</p>
                    {!doc.submitted && (
                      <p className="text-xs text-muted-foreground">
                        Not submitted
                      </p>
                    )}
                  </div>
                </div>
                {doc.submitted && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-xs h-7"
                    onClick={() => {
                      if (doc.url) {
                        window.open(doc.url, "_blank", "noopener,noreferrer");
                      } else {
                        toast({
                          title: "No URL available for this document",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    <Eye className="h-3 w-3" /> View
                  </Button>
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStudentDocsModal(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

function AppCard({
  app,
  children,
  actionLoading,
}: {
  app: Application;
  children: React.ReactNode;
  actionLoading: Record<number, string>;
}) {
  return (
    <Card className="flex flex-col">
      <CardContent className="p-5 flex-1 flex flex-col">
        <div className="flex items-start gap-3 mb-4">
          <Avatar className="h-12 w-12 border-2 border-border/50">
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
              {initials(app.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold leading-tight">{app.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {app.email}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {app.city}
              </span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">
                {app.experience}y exp
              </span>
            </div>
          </div>
        </div>
        <div className="space-y-1.5 mb-3 text-sm">
          <InfoRow label="CNIC" value={app.cnic} />
          <InfoRow label="Qualification" value={app.qualification} />
          <InfoRow label="Level" value={app.level} />
          <InfoRow label="Rate" value={`Rs. ${app.hourlyRate}/hr`} />
          <div className="flex flex-wrap gap-1 pt-1">
            {app.subjects.map((s) => (
              <Badge key={s} variant="secondary" className="text-xs">
                {s}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground pt-1">
            Submitted: {app.submittedAt}
          </p>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-muted-foreground shrink-0 w-24">{label}:</span>
      <span className="font-medium truncate">{value}</span>
    </div>
  );
}

function DocumentsRow({
  app,
  onView,
}: {
  app: Application;
  onView: () => void;
}) {
  const submitted = app.documents.filter((d) => d.submitted).length;
  const total = app.documents.length;
  return (
    <div className="flex items-center justify-between p-3 bg-muted/40 rounded-xl mb-3">
      <div className="flex items-center gap-2 text-sm">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">
          {submitted}/{total} documents
        </span>
        {submitted === total && (
          <span className="text-primary text-xs font-medium">
            All submitted
          </span>
        )}
      </div>
      <Button
        size="sm"
        variant="outline"
        className="h-7 text-xs gap-1"
        onClick={onView}
      >
        <Eye className="h-3 w-3" /> View Docs
      </Button>
    </div>
  );
}

function EmptyOrGrid({
  items,
  children,
  message,
  icon,
}: {
  items: Application[];
  children: React.ReactNode;
  message: string;
  icon: React.ReactNode;
}) {
  if (items.length === 0) {
    return (
      <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          {icon}
        </div>
        <p className="text-muted-foreground text-sm">{message}</p>
      </div>
    );
  }
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>
  );
}

function StudentAppCard({
  app,
  children,
  actionLoading,
}: {
  app: StudentApplication;
  children: React.ReactNode;
  actionLoading: Record<number, string>;
}) {
  return (
    <Card className="flex flex-col">
      <CardContent className="p-5 flex-1 flex flex-col">
        <div className="flex items-start gap-3 mb-4">
          <Avatar className="h-12 w-12 border-2 border-border/50">
            <AvatarFallback className="bg-blue-100 text-blue-700 font-bold text-sm">
              {initials(app.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold leading-tight">{app.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {app.email}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {app.city}
              </span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">
                {app.classLevel}
              </span>
            </div>
          </div>
        </div>
        <div className="space-y-1.5 mb-3 text-sm">
          <InfoRow label="CNIC" value={app.cnic} />
          <InfoRow label="Institution" value={app.institution} />
          <InfoRow label="Class / Level" value={app.classLevel} />
          <p className="text-xs text-muted-foreground pt-1">
            Submitted: {app.submittedAt}
          </p>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

function StudentDocsRow({
  app,
  onView,
}: {
  app: StudentApplication;
  onView: () => void;
}) {
  const submitted = app.documents.filter((d) => d.submitted).length;
  const total = app.documents.length;
  return (
    <div className="flex items-center justify-between p-3 bg-muted/40 rounded-xl mb-3">
      <div className="flex items-center gap-2 text-sm">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">
          {submitted}/{total} documents
        </span>
        {submitted === total && (
          <span className="text-primary text-xs font-medium">
            All submitted
          </span>
        )}
      </div>
      <Button
        size="sm"
        variant="outline"
        className="h-7 text-xs gap-1"
        onClick={onView}
      >
        <Eye className="h-3 w-3" /> View Docs
      </Button>
    </div>
  );
}

function StudentEmptyOrGrid({
  items,
  children,
  message,
  icon,
}: {
  items: StudentApplication[];
  children: React.ReactNode;
  message: string;
  icon: React.ReactNode;
}) {
  if (items.length === 0) {
    return (
      <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          {icon}
        </div>
        <p className="text-muted-foreground text-sm">{message}</p>
      </div>
    );
  }
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>
  );
}
