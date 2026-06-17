"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { api } from "@/services/api";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Mail,
  Phone,
  CheckCircle2,
  Clock,
  Upload,
  FileText,
  ShieldCheck,
  XCircle,
  Info,
  RefreshCw,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

type VerificationStep =
  | "email_otp"
  | "phone_otp"
  | "documents"
  | "under_review"
  | "approved"
  | "rejected";

const STEPS = [
  { label: "Verify Identity", short: "1" },
  { label: "Upload Docs", short: "2" },
  { label: "Under Review", short: "3" },
  { label: "Decision", short: "4" },
];

function stepIndex(s: VerificationStep) {
  if (s === "email_otp" || s === "phone_otp") return 0;
  if (s === "documents") return 1;
  if (s === "under_review") return 2;
  return 3;
}

function OtpInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.split("").concat(Array(6).fill("")).slice(0, 6);

  function handleChange(i: number, e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.replace(/\D/, "").slice(-1);
    const next = [...digits];
    next[i] = val;
    onChange(next.join(""));
    if (val && i < 5) inputs.current[i + 1]?.focus();
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted) {
      onChange(pasted);
      e.preventDefault();
    }
  }

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            inputs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className={cn(
            "w-11 h-12 text-center text-xl font-bold rounded-xl border-2 bg-background outline-none transition-all",
            d ? "border-primary text-primary" : "border-border text-foreground",
            "focus:border-primary focus:ring-2 focus:ring-primary/20",
          )}
        />
      ))}
    </div>
  );
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
      const hrs = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      setRemaining(`${days}d ${hrs}h ${mins}m remaining`);
    };
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, [targetDate]);
  return <span>{remaining}</span>;
}

const BACKEND_STATUS_MAP: Record<string, VerificationStep> = {
  unverified: "email_otp",
  pending_review: "under_review",
  reapplication: "documents",
  approved: "approved",
  rejected: "rejected",
};

export default function StudentVerification() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState<VerificationStep>("email_otp");
  const [profileData, setProfileData] = useState<any>(null);

  /* ── Email OTP state ── */
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpCode, setEmailOtpCode] = useState("");
  const [emailResendSecs, setEmailResendSecs] = useState(0);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  /* ── Phone OTP state ── */
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtpCode, setPhoneOtpCode] = useState("");
  const [phoneResendSecs, setPhoneResendSecs] = useState(0);
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [sendingPhone, setSendingPhone] = useState(false);

  /* ── Document upload state ── */
  const [docs, setDocs] = useState<Record<string, File | null>>({
    cnic_front: null,
    cnic_back: null,
    domicile: null,
    student_card: null,
  });
  const [submitting, setSubmitting] = useState(false);

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
  const isEligible =
    !reapplicationEligibleAt || new Date() >= new Date(reapplicationEligibleAt);

  const DOCS_CONFIG = [
    {
      key: "cnic_front",
      label: "CNIC – Front Side",
      required: true,
      hint: "Clear photo or scan of the front of your CNIC",
    },
    {
      key: "cnic_back",
      label: "CNIC – Back Side",
      required: true,
      hint: "Clear photo or scan of the back of your CNIC",
    },
    {
      key: "domicile",
      label: "Domicile Certificate",
      required: true,
      hint: "Valid domicile certificate issued by NADRA or local authority",
    },
    {
      key: "student_card",
      label: "Institute / Student Card",
      required: false,
      hint: "Optional — student card from your school, college, or university",
    },
  ];

  const requiredDone = DOCS_CONFIG.filter((d) => d.required).every(
    (d) => docs[d.key] !== null,
  );

  /* ── Load verification status on mount ── */
  const loadStatus = useCallback(async () => {
    try {
      const { data } = await api.get("/profile/student-verification-status");
      const d = data.data;
      setProfileData(d);
      const mappedStep =
        BACKEND_STATUS_MAP[d.verificationStatus] ?? "email_otp";
      setStep(mappedStep);
      if (d.isEmailVerified) setEmailVerified(true);
      if (d.isPhoneVerified) {
        if (mappedStep === "email_otp" || mappedStep === "phone_otp")
          setStep("documents");
        localStorage.setItem("student_phone_verified", "true");
      }
    } catch {
      // student profile not created yet — keep defaults
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  /* ── Email resend countdown ── */
  useEffect(() => {
    if (emailResendSecs <= 0) return;
    const id = setTimeout(() => setEmailResendSecs((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [emailResendSecs]);

  /* ── Phone resend countdown ── */
  useEffect(() => {
    if (phoneResendSecs <= 0) return;
    const id = setTimeout(() => setPhoneResendSecs((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [phoneResendSecs]);

  async function sendEmailOtp() {
    setSendingEmail(true);
    try {
      await fetch("/api/auth/verify/email/send", {
        method: "POST",
        credentials: "include",
      });
      setEmailOtpSent(true);
      setEmailResendSecs(60);
      toast({
        title: "OTP sent to your email",
        description: `A verification code has been sent to ${user?.email || "your email"}.`,
      });
    } catch {
      toast({
        title: "Failed to send OTP",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSendingEmail(false);
    }
  }

  async function verifyEmailOtp() {
    if (emailOtpCode.length < 6) return;
    setVerifyingEmail(true);
    try {
      const res = await fetch("/api/auth/verify/email", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: emailOtpCode }),
      });
      if (res.ok) {
        setEmailVerified(true);
        setStep("phone_otp");
        toast({
          title: "Email verified!",
          description: "Now verify your phone number to unlock bookings.",
        });
      } else {
        toast({
          title: "Incorrect OTP",
          description: "Please check your email and try again.",
          variant: "destructive",
        });
        setEmailOtpCode("");
      }
    } catch {
      toast({
        title: "Verification failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setVerifyingEmail(false);
    }
  }

  function formatPakPhone(raw: string) {
    const digits = raw.replace(/\D/g, "");
    if (digits.startsWith("0")) return digits.slice(0, 11);
    if (digits.startsWith("92")) return digits.slice(0, 12);
    return digits.slice(0, 10);
  }

  async function sendPhoneOtp() {
    const digits = phoneNumber.replace(/\D/g, "");
    if (digits.length < 10) {
      toast({
        title: "Enter a valid Pakistani number",
        variant: "destructive",
      });
      return;
    }
    setSendingPhone(true);
    try {
      await fetch("/api/auth/verify/phone/send", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneNumber }),
      });
      setPhoneOtpSent(true);
      setPhoneResendSecs(60);
      toast({
        title: "OTP sent via WhatsApp",
        description: `A verification code has been sent to ${phoneNumber}.`,
      });
    } catch {
      toast({
        title: "Failed to send OTP",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSendingPhone(false);
    }
  }

  async function verifyPhoneOtp() {
    if (phoneOtpCode.length < 6) return;
    setVerifyingPhone(true);
    try {
      const res = await fetch("/api/auth/verify/phone", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneNumber, code: phoneOtpCode }),
      });
      if (res.ok) {
        setStep("documents");
        toast({
          title: "Phone verified!",
          description: "Identity confirmed. You can now upload documents.",
        });
      } else {
        toast({
          title: "Incorrect OTP",
          description: "Please check your phone and try again.",
          variant: "destructive",
        });
        setPhoneOtpCode("");
      }
    } catch {
      toast({
        title: "Verification failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setVerifyingPhone(false);
    }
  }

  async function submitDocs() {
    if (!requiredDone) {
      toast({
        title: "Missing required documents",
        description:
          "Please upload CNIC (front & back) and your domicile certificate.",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    try {
      for (const [key, file] of Object.entries(docs)) {
        if (!file) continue;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("docType", key);
        await api.post("/profile/documents", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      await api.post("/profile/submit-student-verification");
      setStep("under_review");
      toast({
        title: "Documents submitted",
        description: "Our team will review them within 1–2 business days.",
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

  function handleFileChange(
    key: string,
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
    setDocs((p) => ({ ...p, [key]: file }));
  }

  function handleReapply() {
    setDocs({
      cnic_front: null,
      cnic_back: null,
      domicile: null,
      student_card: null,
    });
    setStep("documents");
    setProfileData(null);
    toast({
      title: "New application started",
      description: "Please upload your updated documents.",
    });
  }

  const active = stepIndex(step);

  return (
    <DashboardLayout title="Account Verification">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Step Progress */}
        <div className="bg-background border border-border/60 rounded-2xl p-6">
          <div className="flex items-center gap-0">
            {STEPS.map((s, i) => {
              const done = i < active;
              const current = i === active;
              const rejected = step === "rejected" && i === 3;
              return (
                <div key={i} className="flex items-center flex-1 min-w-0">
                  <div className="flex flex-col items-center gap-1.5 shrink-0">
                    <div
                      className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all",
                        done
                          ? "bg-primary border-primary text-white"
                          : rejected
                            ? "bg-destructive border-destructive text-white"
                            : current
                              ? "bg-primary/10 border-primary text-primary"
                              : "bg-muted border-border text-muted-foreground",
                      )}
                    >
                      {done ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : rejected ? (
                        <XCircle className="h-4 w-4" />
                      ) : (
                        s.short
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
                      {s.label}
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

          {/* Phase indicator for step 1 */}
          {(step === "email_otp" || step === "phone_otp") && (
            <div className="mt-4 flex items-center gap-3 pt-4 border-t border-border/40">
              <div
                className={cn(
                  "flex items-center gap-1.5 text-xs font-medium",
                  emailVerified ? "text-primary" : "text-primary",
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-[10px]",
                    emailVerified
                      ? "bg-primary text-white"
                      : "bg-primary/10 text-primary border border-primary",
                  )}
                >
                  {emailVerified ? <CheckCircle2 className="h-3 w-3" /> : "A"}
                </div>
                Email OTP
              </div>
              <div
                className={cn(
                  "flex-1 h-px",
                  emailVerified ? "bg-primary/40" : "bg-border",
                )}
              />
              <div
                className={cn(
                  "flex items-center gap-1.5 text-xs font-medium",
                  step === "phone_otp"
                    ? "text-primary"
                    : "text-muted-foreground",
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-[10px]",
                    step === "phone_otp"
                      ? "bg-primary/10 text-primary border border-primary"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  B
                </div>
                Phone OTP
              </div>
            </div>
          )}
        </div>

        {/* ── Step 1a: Email OTP ── */}
        {step === "email_otp" && (
          <Card>
            <CardContent className="p-8 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                  <Mail className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-1">Verify Your Email</h2>
                  <p className="text-sm text-muted-foreground">
                    We'll send a 6-digit code to{" "}
                    <strong>{user?.email || "your email address"}</strong>. This
                    confirms your account ownership.
                  </p>
                </div>
              </div>

              {!emailOtpSent ? (
                <Button
                  className="w-full h-12 gap-2 text-base font-semibold"
                  onClick={sendEmailOtp}
                  disabled={sendingEmail}
                >
                  {sendingEmail ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" /> Sending…
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" /> Send OTP to My Email
                    </>
                  )}
                </Button>
              ) : (
                <div className="space-y-5">
                  <div className="space-y-3">
                    <Label className="text-center block text-sm text-muted-foreground">
                      Enter the 6-digit code from your email
                    </Label>
                    <OtpInput value={emailOtpCode} onChange={setEmailOtpCode} />
                  </div>

                  <Button
                    className="w-full h-12 gap-2 text-base font-semibold"
                    onClick={verifyEmailOtp}
                    disabled={emailOtpCode.length < 6 || verifyingEmail}
                  >
                    {verifyingEmail ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />{" "}
                        Verifying…
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" /> Verify Email
                      </>
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-2 text-sm">
                    <span className="text-muted-foreground">
                      Didn't receive it?
                    </span>
                    {emailResendSecs > 0 ? (
                      <span className="text-muted-foreground font-medium">
                        Resend in {emailResendSecs}s
                      </span>
                    ) : (
                      <button
                        onClick={sendEmailOtp}
                        className="text-primary font-semibold hover:underline"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>

                  <div className="flex items-start gap-2 text-xs text-muted-foreground p-3 bg-muted/30 rounded-lg">
                    <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary" />
                    Check your spam/junk folder if you don't see it. The code
                    expires in 10 minutes.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ── Step 1b: Phone OTP ── */}
        {step === "phone_otp" && (
          <Card>
            <CardContent className="p-8 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center shrink-0">
                  <Phone className="h-7 w-7 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-1">
                    Verify Your Phone Number
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    A Pakistani phone number confirms a real person is behind
                    this account and <strong>unlocks booking</strong>.
                  </p>
                </div>
              </div>

              {!phoneOtpSent ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone-input">
                      Pakistani Phone Number{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-sm text-muted-foreground font-medium select-none">
                        +92
                      </span>
                      <Input
                        id="phone-input"
                        placeholder="300 0000000"
                        className="pl-12"
                        value={phoneNumber}
                        onChange={(e) =>
                          setPhoneNumber(formatPakPhone(e.target.value))
                        }
                        maxLength={11}
                        inputMode="numeric"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Enter your 10-digit number (e.g. 0300 1234567)
                    </p>
                  </div>
                  <Button
                    className="w-full h-12 gap-2 text-base font-semibold"
                    onClick={sendPhoneOtp}
                    disabled={
                      sendingPhone || phoneNumber.replace(/\D/g, "").length < 10
                    }
                  >
                    {sendingPhone ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" /> Sending…
                      </>
                    ) : (
                      <>
                        <Phone className="h-4 w-4" /> Send OTP via SMS
                      </>
                    )}
                  </Button>

                  <div className="flex items-start gap-2 text-xs text-muted-foreground p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-blue-500" />
                    <span>
                      Your phone number will only be used for account security.
                      It won't be shown to tutors or other users.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="p-3 bg-muted/40 rounded-lg text-sm flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">
                      OTP sent to{" "}
                      <strong className="text-foreground">
                        +92{phoneNumber}
                      </strong>
                    </span>
                    <button
                      onClick={() => setPhoneOtpSent(false)}
                      className="ml-auto text-xs text-primary hover:underline"
                    >
                      Change
                    </button>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-center block text-sm text-muted-foreground">
                      Enter the 6-digit code sent to your phone
                    </Label>
                    <OtpInput value={phoneOtpCode} onChange={setPhoneOtpCode} />
                  </div>

                  <Button
                    className="w-full h-12 gap-2 text-base font-semibold"
                    onClick={verifyPhoneOtp}
                    disabled={phoneOtpCode.length < 6 || verifyingPhone}
                  >
                    {verifyingPhone ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />{" "}
                        Verifying…
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" /> Verify Phone
                      </>
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-2 text-sm">
                    <span className="text-muted-foreground">
                      Didn't receive it?
                    </span>
                    {phoneResendSecs > 0 ? (
                      <span className="text-muted-foreground font-medium">
                        Resend in {phoneResendSecs}s
                      </span>
                    ) : (
                      <button
                        onClick={sendPhoneOtp}
                        className="text-primary font-semibold hover:underline"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>

                  <div className="flex items-start gap-2 text-xs text-muted-foreground p-3 bg-muted/30 rounded-lg">
                    <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary" />
                    SMS may take up to 2 minutes. The code expires in 10
                    minutes.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ── Step 2: Document Upload ── */}
        {step === "documents" && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
              <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-primary mb-1">
                  Documents reviewed within 1–2 business days
                </p>
                <p className="text-muted-foreground">
                  Upload clear, legible scans or photos. Max 5 MB per file.
                  Accepted: JPG, PNG, PDF.
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {DOCS_CONFIG.map((d) => (
                <DocCard
                  key={d.key}
                  label={d.label}
                  hint={d.hint}
                  required={d.required}
                  file={docs[d.key]}
                  onChange={(e) => handleFileChange(d.key, e)}
                />
              ))}
            </div>

            <Button
              className="w-full h-12 text-base font-semibold gap-2"
              onClick={submitDocs}
              disabled={submitting || !requiredDone}
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

        {/* ── Step 3: Under Review ── */}
        {step === "under_review" && (
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
                  Your documents have been received. Our team will review them
                  within <strong>1–2 business days</strong>. You can still
                  browse and book tutors while waiting.
                </p>
              </div>
              <Badge className="bg-amber-100 text-amber-700 border-amber-200 border gap-1.5 text-sm py-1.5 px-4">
                <Clock className="h-3.5 w-3.5" /> Awaiting Review
              </Badge>
              <div className="bg-muted/40 rounded-xl p-4 text-left mt-2 space-y-2 text-sm">
                <p className="font-medium text-muted-foreground text-xs uppercase">
                  Submitted documents
                </p>
                {DOCS_CONFIG.map((d) => (
                  <div
                    key={d.key}
                    className={cn(
                      "flex items-center gap-2 text-sm",
                      docs[d.key]
                        ? "text-foreground"
                        : "text-muted-foreground/50",
                    )}
                  >
                    <CheckCircle2
                      className={cn(
                        "h-4 w-4 shrink-0",
                        docs[d.key]
                          ? "text-primary"
                          : "text-muted-foreground/30",
                      )}
                    />
                    {d.label}
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

        {/* ── Step 4a: Approved ── */}
        {step === "approved" && (
          <Card className="border-primary/20">
            <CardContent className="p-8 text-center space-y-5">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck className="h-10 w-10 text-primary" />
              </div>
              <Badge className="bg-primary/10 text-primary border-primary/20 border gap-1.5 mb-2 text-sm py-1.5 px-4">
                <CheckCircle2 className="h-4 w-4" /> Verified Student
              </Badge>
              <div>
                <h2 className="text-2xl font-extrabold mb-2">
                  Account Verified!
                </h2>
                <p className="text-muted-foreground max-w-sm mx-auto text-sm leading-relaxed">
                  Your identity has been confirmed. You can now book sessions,
                  send requests to tutors, and use the free trial.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-1">
                {[
                  "Request any tutor",
                  "2-day free trial active",
                  "Priority support",
                ].map((t) => (
                  <div
                    key={t}
                    className="bg-muted/40 rounded-xl p-3 text-xs font-medium text-center leading-snug"
                  >
                    {t}
                  </div>
                ))}
              </div>
              <Button className="gap-2">
                Find a Tutor <ChevronRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ── Step 4b: Rejected ── */}
        {step === "rejected" && (
          <Card className="border-destructive/20">
            <CardContent className="p-8 space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-destructive/10 rounded-2xl flex items-center justify-center shrink-0">
                  <XCircle className="h-7 w-7 text-destructive" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-1">
                    Verification Rejected
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Your documents could not be verified. Please see the reason
                    below.
                  </p>
                </div>
              </div>
              <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4">
                <p className="text-sm font-semibold text-destructive mb-2">
                  Reason:
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  "{REJECTION.reason}"
                </p>
              </div>
              {isEligible ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-2 text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">
                    <Info className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                    You are now eligible to reapply. Please address the reason
                    above before submitting new documents.
                  </div>
                  <Button onClick={handleReapply} className="w-full h-11 gap-2">
                    <RefreshCw className="h-4 w-4" /> Submit New Documents
                  </Button>
                </div>
              ) : (
                <div className="bg-muted/40 rounded-xl p-4 text-center space-y-1">
                  <p className="text-xs text-muted-foreground uppercase font-semibold">
                    You can reapply in
                  </p>
                  <p className="text-lg font-bold">
                    <CountdownTimer
                      targetDate={REJECTION.reapplicationEligibleAt}
                    />
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Eligible from{" "}
                    {new Date(
                      REJECTION.reapplicationEligibleAt,
                    ).toLocaleDateString("en-PK", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Dev preview switcher */}
        <div className="border border-dashed border-border/60 rounded-xl p-4">
          <p className="text-xs text-muted-foreground font-medium mb-3 uppercase">
            Preview states (dev only)
          </p>
          <div className="flex flex-wrap gap-2">
            {(
              [
                "email_otp",
                "phone_otp",
                "documents",
                "under_review",
                "approved",
                "rejected",
              ] as VerificationStep[]
            ).map((s) => (
              <button
                key={s}
                onClick={() => setStep(s)}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-full border transition-colors",
                  step === s
                    ? "bg-primary text-white border-primary"
                    : "border-border text-muted-foreground hover:bg-muted",
                )}
              >
                {s.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function DocCard({
  label,
  hint,
  required,
  file,
  onChange,
}: {
  label: string;
  hint: string;
  required: boolean;
  file: File | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div
      onClick={() => ref.current?.click()}
      className={cn(
        "border-2 rounded-xl p-4 cursor-pointer transition-all",
        file
          ? "border-primary/40 bg-primary/5"
          : "border-dashed border-border hover:border-primary/40 hover:bg-muted/30",
      )}
    >
      <input
        ref={ref}
        type="file"
        accept=".jpg,.jpeg,.png,.pdf"
        className="hidden"
        onChange={onChange}
      />
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
            file ? "bg-primary/10" : "bg-muted",
          )}
        >
          {file ? (
            <CheckCircle2 className="h-5 w-5 text-primary" />
          ) : (
            <FileText className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-sm font-semibold">{label}</p>
            {!required && (
              <Badge
                variant="outline"
                className="text-xs h-4 px-1.5 border-muted-foreground/30 text-muted-foreground"
              >
                optional
              </Badge>
            )}
            {required && !file && (
              <span className="text-xs text-destructive font-medium">
                Required
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
            {file ? (
              <span className="text-primary font-medium truncate block">
                {file.name}
              </span>
            ) : (
              hint
            )}
          </p>
        </div>
      </div>
      {!file && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-primary font-medium">
          <Upload className="h-3.5 w-3.5" /> Click to upload
        </div>
      )}
    </div>
  );
}
