"use client";
import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import { api } from "@/services/api";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Upload,
  CheckCircle2,
  Clock,
  Video,
  XCircle,
  ShieldCheck,
  FileText,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Copy,
  Info,
  ChevronRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type VerificationStep =
  | "not_submitted"
  | "under_review"
  | "interview_scheduled"
  | "approved"
  | "rejected";

interface DocumentFile {
  file: File | null;
  name: string;
  required: boolean;
  label: string;
  hint: string;
}

const STEPS = [
  { id: "not_submitted", label: "Submit Docs", short: "1" },
  { id: "under_review", label: "Under Review", short: "2" },
  { id: "interview_scheduled", label: "Interview", short: "3" },
  { id: "approved", label: "Decision", short: "4" },
];

function stepIndex(status: VerificationStep): number {
  if (status === "not_submitted") return 0;
  if (status === "under_review") return 1;
  if (status === "interview_scheduled") return 2;
  if (status === "approved" || status === "rejected") return 3;
  return 0;
}

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [remaining, setRemaining] = useState("");
  useEffect(() => {
    const update = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) {
        setRemaining("Eligible now");
        return;
      }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      setRemaining(`${days}d ${hours}h ${mins}m remaining`);
    };
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, [targetDate]);
  return <span>{remaining}</span>;
}

const BACKEND_STATUS_MAP: Record<string, VerificationStep> = {
  unverified: "not_submitted",
  documents_submitted: "under_review",
  reapplication: "under_review",
  interview_scheduled: "interview_scheduled",
  approved: "approved",
  rejected: "rejected",
};

export default function VerificationStatus() {
  const { toast } = useToast();

  const [status, setStatus] = useState<VerificationStep>("not_submitted");
  const [submitting, setSubmitting] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [docs, setDocs] = useState<Record<string, File | null>>({
    cnic_front: null,
    cnic_back: null,
    degree: null,
    experience: null,
  });

  const loadStatus = useCallback(async () => {
    try {
      const { data } = await api.get("/profile/verification-status");
      const d = data.data;
      setProfileData(d);
      setStatus(BACKEND_STATUS_MAP[d.verificationStatus] ?? "not_submitted");
    } catch {
      // not a tutor or not yet set up — keep default
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const DOCUMENTS: DocumentFile[] = [
    {
      file: docs.cnic_front,
      name: "cnic_front",
      required: true,
      label: "CNIC – Front Side",
      hint: "Clear photo or scan of the front of your CNIC",
    },
    {
      file: docs.cnic_back,
      name: "cnic_back",
      required: true,
      label: "CNIC – Back Side",
      hint: "Clear photo or scan of the back of your CNIC",
    },
    {
      file: docs.degree,
      name: "degree",
      required: true,
      label: "Degree / Qualification",
      hint: "Your highest qualification certificate",
    },
    {
      file: docs.experience,
      name: "experience",
      required: false,
      label: "Experience Letter",
      hint: "Optional — from a school, academy, or employer",
    },
  ];

  const requiredSubmitted = DOCUMENTS.filter((d) => d.required).every(
    (d) => d.file !== null,
  );

  const INTERVIEW = {
    platform: "Google Meet / Zoom",
    link: profileData?.interviewLink || "",
    date: profileData?.interviewDate
      ? new Date(profileData.interviewDate).toLocaleDateString("en-PK", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "To be announced",
    time: "As per scheduled time (PKT)",
    scheduledAt: profileData?.interviewDate ?? "",
  };

  const rejectedAt = profileData?.rejectedAt ?? null;
  const reapplicationEligibleAt = rejectedAt
    ? new Date(new Date(rejectedAt).getTime() + 15 * 86400000).toISOString()
    : null;
  const REJECTION = {
    reason: profileData?.verificationNotes || "No reason provided.",
    rejectedAt: rejectedAt ?? "",
    reapplicationEligibleAt:
      reapplicationEligibleAt ?? new Date().toISOString(),
  };
  const isEligibleToReapply =
    !reapplicationEligibleAt || new Date() >= new Date(reapplicationEligibleAt);

  function handleFileChange(
    name: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0] ?? null;
    if (file && file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 5 MB.",
        variant: "destructive",
      });
      return;
    }
    setDocs((prev) => ({ ...prev, [name]: file }));
  }

  async function handleSubmit() {
    if (!requiredSubmitted) {
      toast({
        title: "Missing required documents",
        description:
          "Please upload CNIC (front & back) and your degree certificate.",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    try {
      const docNameMap: Record<string, string> = {
        experience: "experience_letter",
      };
      for (const [key, file] of Object.entries(docs)) {
        if (!file) continue;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("docType", docNameMap[key] ?? key);
        await api.post("/profile/documents", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      await api.post("/profile/submit-verification");
      setStatus("under_review");
      toast({
        title: "Documents submitted successfully",
        description: "Our team will review them within 2–3 business days.",
      });
    } catch (err: any) {
      toast({
        title: "Submission failed",
        description: err?.response?.data?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  function handleReapply() {
    setDocs({
      cnic_front: null,
      cnic_back: null,
      degree: null,
      experience: null,
    });
    setStatus("not_submitted");
    setProfileData(null);
    toast({
      title: "New application started",
      description: "Please upload your updated documents.",
    });
  }

  function copyLink() {
    navigator.clipboard.writeText(INTERVIEW.link);
    toast({ title: "Link copied to clipboard" });
  }

  const active = stepIndex(status);

  return (
    <DashboardLayout title="Verification Status">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Step Progress */}
        <div className="bg-background border border-border/60 rounded-2xl p-6">
          <div className="flex items-center gap-0">
            {STEPS.map((step, i) => {
              const done = i < active;
              const current = i === active;
              const isRejected = status === "rejected" && i === 3;
              return (
                <div key={step.id} className="flex items-center flex-1 min-w-0">
                  <div className="flex flex-col items-center gap-1.5 shrink-0">
                    <div
                      className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all",
                        done
                          ? "bg-primary border-primary text-white"
                          : isRejected
                            ? "bg-destructive border-destructive text-white"
                            : current
                              ? "bg-primary/10 border-primary text-primary"
                              : "bg-muted border-border text-muted-foreground",
                      )}
                    >
                      {done ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : isRejected ? (
                        <XCircle className="h-4 w-4" />
                      ) : (
                        step.short
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-xs font-medium text-center leading-tight hidden sm:block",
                        current
                          ? "text-primary"
                          : done
                            ? "text-primary/80"
                            : "text-muted-foreground",
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={cn(
                        "flex-1 h-0.5 mx-2 rounded-full transition-all",
                        i < active ? "bg-primary" : "bg-border",
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 1 – Submit Documents */}
        {status === "not_submitted" && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
              <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-primary mb-1">
                  Documents are reviewed within 2–3 business days
                </p>
                <p className="text-muted-foreground">
                  All files must be clear, legible scans or photos. Max file
                  size: 5 MB per document. Accepted formats: JPG, PNG, PDF.
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {DOCUMENTS.map((doc) => (
                <DocumentUploadCard
                  key={doc.name}
                  doc={doc}
                  onChange={(e) => handleFileChange(doc.name, e)}
                />
              ))}
            </div>

            <Button
              className="w-full h-12 text-base font-semibold gap-2"
              onClick={handleSubmit}
              disabled={submitting || !requiredSubmitted}
            >
              {submitting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Submitting…
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" /> Submit for Verification
                </>
              )}
            </Button>
          </div>
        )}

        {/* Step 2 – Under Review */}
        {status === "under_review" && (
          <Card>
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                <Clock className="h-8 w-8 text-amber-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">
                  Documents Under Review
                </h2>
                <p className="text-muted-foreground max-w-sm mx-auto text-sm leading-relaxed">
                  Your documents have been received. Our verification team will
                  review them within <strong>2–3 business days</strong>. You'll
                  be notified once a decision is made.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <Badge className="bg-amber-100 text-amber-700 border-amber-200 border gap-1.5 text-sm py-1 px-3">
                  <Clock className="h-3.5 w-3.5" />
                  Awaiting Review
                </Badge>
              </div>
              <div className="bg-muted/40 rounded-xl p-4 text-left mt-4 space-y-2 text-sm">
                <p className="font-medium">Documents submitted:</p>
                {DOCUMENTS.map((d) => (
                  <div
                    key={d.name}
                    className="flex items-center gap-2 text-muted-foreground"
                  >
                    <CheckCircle2
                      className={cn(
                        "h-4 w-4 shrink-0",
                        d.file || !d.required
                          ? "text-primary"
                          : "text-muted-foreground/40",
                      )}
                    />
                    {d.label}{" "}
                    {!d.required && (
                      <span className="text-xs text-muted-foreground/60">
                        (optional)
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3 – Interview Scheduled */}
        {status === "interview_scheduled" && (
          <Card className="border-primary/20">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                  <Video className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-1">
                    Interview Scheduled
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Your documents were approved. The next step is a short
                    interview via {INTERVIEW.platform}.
                  </p>
                </div>
              </div>

              <div className="bg-muted/40 rounded-xl p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs uppercase font-semibold mb-1">
                      Platform
                    </p>
                    <p className="font-semibold">{INTERVIEW.platform}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs uppercase font-semibold mb-1">
                      Scheduled By
                    </p>
                    <p className="font-semibold">{INTERVIEW.scheduledAt}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs uppercase font-semibold mb-1">
                      Date
                    </p>
                    <p className="font-semibold">{INTERVIEW.date}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs uppercase font-semibold mb-1">
                      Time
                    </p>
                    <p className="font-semibold">{INTERVIEW.time}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/50">
                  <p className="text-muted-foreground text-xs uppercase font-semibold mb-2">
                    Meeting Link
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs bg-background border border-border rounded-lg px-3 py-2 truncate font-mono">
                      {INTERVIEW.link}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 shrink-0"
                      onClick={copyLink}
                    >
                      <Copy className="h-3.5 w-3.5" /> Copy
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button className="flex-1 gap-2" asChild>
                  <a
                    href={INTERVIEW.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" /> Join Meeting
                  </a>
                </Button>
                <Button variant="outline" className="gap-2" onClick={copyLink}>
                  <Copy className="h-4 w-4" /> Copy Link
                </Button>
              </div>

              <div className="flex items-start gap-2 text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
                Please join 5 minutes early and ensure your camera and
                microphone are working.
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4a – Approved */}
        {status === "approved" && (
          <Card className="border-primary/20">
            <CardContent className="p-8 text-center space-y-5">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck className="h-10 w-10 text-primary" />
              </div>
              <div>
                <Badge className="bg-primary/10 text-primary border-primary/20 border gap-1.5 mb-4 text-sm py-1.5 px-4">
                  <CheckCircle2 className="h-4 w-4" /> Verified Tutor
                </Badge>
                <h2 className="text-2xl font-extrabold mb-2">
                  Congratulations!
                </h2>
                <p className="text-muted-foreground max-w-sm mx-auto text-sm leading-relaxed">
                  You are now a <strong>Verified TutorFinder Tutor</strong>.
                  Your profile is live and visible to students across Pakistan.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-2">
                {[
                  "Your profile is live",
                  "Verification badge shown",
                  "Students can contact you",
                ].map((t) => (
                  <div
                    key={t}
                    className="bg-muted/40 rounded-xl p-3 text-xs font-medium text-center leading-snug"
                  >
                    {t}
                  </div>
                ))}
              </div>
              <Link href="/dashboard/tutor/profile">
                <Button className="gap-2">
                  View My Profile <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Step 4b – Rejected */}
        {status === "rejected" && (
          <Card className="border-destructive/20">
            <CardContent className="p-8 space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-destructive/10 rounded-2xl flex items-center justify-center shrink-0">
                  <XCircle className="h-7 w-7 text-destructive" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-1">
                    Application Rejected
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Your verification application was reviewed and could not be
                    approved at this time.
                  </p>
                </div>
              </div>

              <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4">
                <p className="text-sm font-semibold text-destructive mb-2">
                  Reason for rejection:
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  "{REJECTION.reason}"
                </p>
              </div>

              {isEligibleToReapply ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-2 text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">
                    <Info className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                    You are now eligible to reapply. Please address the
                    rejection reason before submitting new documents.
                  </div>
                  <Button onClick={handleReapply} className="w-full h-11 gap-2">
                    <RefreshCw className="h-4 w-4" /> Submit New Application
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-muted/40 rounded-xl p-4 text-center">
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">
                      You can reapply in
                    </p>
                    <p className="text-lg font-bold text-foreground">
                      <CountdownTimer
                        targetDate={REJECTION.reapplicationEligibleAt}
                      />
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Eligible on{" "}
                      {new Date(
                        REJECTION.reapplicationEligibleAt,
                      ).toLocaleDateString("en-PK", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <Button
                    disabled
                    className="w-full h-11 gap-2"
                    variant="outline"
                  >
                    <Clock className="h-4 w-4" /> Reapply Not Available Yet
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

function DocumentUploadCard({
  doc,
  onChange,
}: {
  doc: DocumentFile;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hasFile = doc.file !== null;

  return (
    <div
      className={cn(
        "border-2 rounded-xl p-4 transition-all cursor-pointer",
        hasFile
          ? "border-primary/40 bg-primary/5"
          : "border-dashed border-border hover:border-primary/40 hover:bg-muted/30",
      )}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.pdf"
        className="hidden"
        onChange={onChange}
      />
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
            hasFile ? "bg-primary/10" : "bg-muted",
          )}
        >
          {hasFile ? (
            <CheckCircle2 className="h-5 w-5 text-primary" />
          ) : (
            <FileText className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold truncate">{doc.label}</p>
            {!doc.required && (
              <span className="text-xs text-muted-foreground">(optional)</span>
            )}
            {doc.required && !hasFile && (
              <span className="text-xs text-destructive font-medium">
                Required
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
            {hasFile ? (
              <span className="text-primary font-medium truncate block">
                {doc.file?.name}
              </span>
            ) : (
              doc.hint
            )}
          </p>
        </div>
      </div>
      {!hasFile && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-primary font-medium">
          <Upload className="h-3.5 w-3.5" /> Click to upload
        </div>
      )}
    </div>
  );
}
