import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const router = useRouter();
  const { login, user } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      const redirect = user.role === "admin" ? "/dashboard/admin" : user.role === "tutor" ? "/dashboard/tutor" : "/dashboard/student";
      router.replace(redirect);
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast({ title: "Please fill in all fields", variant: "destructive" });
    setLoading(true);
    try {
      await login(form);
    } catch (err: any) {
      toast({ title: err?.response?.data?.message || "Invalid credentials", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-secondary p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl translate-x-1/4 translate-y-1/4" />
        </div>
        <Link href="/" className="flex items-center gap-2 relative z-10">
          <div className="bg-primary rounded-lg p-1.5 flex items-center justify-center font-bold text-white text-sm w-9 h-9">TF</div>
          <span className="text-xl font-bold text-white">TutorFinder</span>
        </Link>
        <div className="relative z-10 text-white">
          <h2 className="text-4xl font-extrabold mb-4 leading-tight">Welcome back to Pakistan's #1 Tutoring Platform</h2>
          <p className="text-white/70 text-lg leading-relaxed">Connect with 2,500+ verified tutors across Lahore, Islamabad, and Karachi.</p>
          <div className="mt-10 grid grid-cols-2 gap-4">
            {[["2,500+", "Expert Tutors"], ["10k+", "Happy Students"], ["4.9", "Avg Rating"], ["3 Cities", "Across Pakistan"]].map(([v, l]) => (
              <div key={l} className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="text-2xl font-bold text-primary">{v}</div>
                <div className="text-white/70 text-sm mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/40 text-sm relative z-10">© 2025 TutorFinder. All rights reserved.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="lg:hidden flex items-center gap-2 justify-center mb-6">
              <div className="bg-primary rounded-lg p-1.5 font-bold text-white text-sm w-9 h-9 flex items-center justify-center">TF</div>
              <span className="text-xl font-bold">TutorFinder</span>
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight">Sign in to your account</h1>
            <p className="text-muted-foreground mt-2">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} className="h-11" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Input id="password" type={showPass ? "text" : "password"} placeholder="••••••••" value={form.password} onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))} className="h-11 pr-10" />
                <button type="button" className="absolute right-3 top-3 text-muted-foreground" onClick={() => setShowPass(p => !p)}>
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Signing in...</> : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary font-semibold hover:underline">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
