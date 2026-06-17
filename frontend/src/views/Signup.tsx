import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, GraduationCap, BookOpen, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Role } from "@/types";
import { cn } from "@/lib/utils";

const CITIES = ["Lahore", "Islamabad", "Karachi"];

function formatCNIC(raw: string): string {
  const digits = raw.replace(/\D/g, "").substring(0, 13);
  if (digits.length <= 5)  return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
}

function isValidCNIC(cnic: string): boolean {
  return /^\d{5}-\d{7}-\d{1}$/.test(cnic);
}

export default function Signup() {
  const router = useRouter();
  const { signup, user } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", city: "", role: "student" as Role, cnic: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace(user.role === "admin" ? "/dashboard/admin" : user.role === "tutor" ? "/dashboard/tutor" : "/dashboard/student");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast({ title: "Please fill in all required fields", variant: "destructive" });
    if (form.password.length < 6) return toast({ title: "Password must be at least 6 characters", variant: "destructive" });
    if (form.role === "tutor" && !isValidCNIC(form.cnic)) return toast({ title: "Invalid CNIC", description: "Please enter your CNIC in the format: XXXXX-XXXXXXX-X", variant: "destructive" });
    setLoading(true);
    try {
      await signup(form);
    } catch (err: any) {
      toast({ title: err?.response?.data?.message || "Signup failed. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-secondary p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary rounded-full blur-3xl translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent rounded-full blur-3xl -translate-x-1/4" />
        </div>
        <Link href="/" className="flex items-center gap-2 relative z-10">
          <div className="bg-primary rounded-lg p-1.5 font-bold text-white text-sm w-9 h-9 flex items-center justify-center">TF</div>
          <span className="text-xl font-bold text-white">TutorFinder</span>
        </Link>
        <div className="relative z-10 text-white space-y-6">
          <h2 className="text-4xl font-extrabold leading-tight">Start your learning journey today</h2>
          <p className="text-white/70 text-lg">Join thousands of students and tutors building better futures across Pakistan.</p>
          <div className="space-y-3">
            {["Free to join, no hidden fees", "2-day free trial with any tutor", "Verified & background-checked tutors", "Online & home tutoring options"].map(f => (
              <div key={f} className="flex items-center gap-3 text-white/90">
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0">✓</div>
                {f}
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/40 text-sm relative z-10">© 2025 TutorFinder. All rights reserved.</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-background overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="text-center mb-8">
            <Link href="/" className="lg:hidden flex items-center gap-2 justify-center mb-6">
              <div className="bg-primary rounded-lg p-1.5 font-bold text-white text-sm w-9 h-9 flex items-center justify-center">TF</div>
              <span className="text-xl font-bold">TutorFinder</span>
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight">Create your account</h1>
            <p className="text-muted-foreground mt-2">Join TutorFinder for free</p>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <Label className="text-sm font-medium mb-3 block">I am a...</Label>
            <div className="grid grid-cols-2 gap-3">
              {([["student", "Student", GraduationCap, "I want to learn"], ["tutor", "Tutor", BookOpen, "I want to teach"]] as const).map(([role, label, Icon, sub]) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, role }))}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 text-left",
                    form.role === role
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border bg-card hover:border-primary/50 hover:bg-muted/30"
                  )}
                >
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", form.role === role ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className={cn("font-semibold text-sm", form.role === role ? "text-primary" : "text-foreground")}>{label}</p>
                    <p className="text-xs text-muted-foreground">{sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name <span className="text-destructive">*</span></Label>
              <Input placeholder="Muhammad Ali" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="h-11" />
            </div>
            <div className="space-y-2">
              <Label>Email Address <span className="text-destructive">*</span></Label>
              <Input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="h-11" />
            </div>
            <div className="space-y-2">
              <Label>Password <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Input type={showPass ? "text" : "password"} placeholder="Min. 6 characters" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="h-11 pr-10" />
                <button type="button" className="absolute right-3 top-3 text-muted-foreground" onClick={() => setShowPass(p => !p)}>
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input placeholder="+92 300 0000000" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <select className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}>
                  <option value="">Select city</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* CNIC — required for both students and tutors */}
            <div className="space-y-2">
              <Label>CNIC <span className="text-destructive">*</span></Label>
              <Input
                placeholder="XXXXX-XXXXXXX-X"
                value={form.cnic}
                onChange={e => setForm(f => ({ ...f, cnic: formatCNIC(e.target.value) }))}
                className={cn("h-11 font-mono tracking-wide", form.cnic && !isValidCNIC(form.cnic) && "border-destructive focus-visible:ring-destructive")}
                maxLength={15}
                inputMode="numeric"
              />
              <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary" />
                {form.role === "tutor"
                  ? "Your CNIC prevents duplicate tutor accounts and is used for identity verification. Never shared publicly."
                  : "Your CNIC ensures account security and prevents misuse of the platform. Never shared publicly."}
              </div>
              {form.cnic && !isValidCNIC(form.cnic) && (
                <p className="text-xs text-destructive">Format must be: XXXXX-XXXXXXX-X</p>
              )}
            </div>

            <Button type="submit" className="w-full h-11 text-base font-semibold mt-2" disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating account...</> : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
