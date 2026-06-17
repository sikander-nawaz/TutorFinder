import { useState } from "react";
import Link from "next/link";
import { authService } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, MailCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast({ title: "Please enter your email", variant: "destructive" });
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (err: any) {
      toast({ title: err?.response?.data?.message || "Failed to send reset email", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">
        <div className="bg-background border border-border rounded-2xl p-8 shadow-sm">
          <Link href="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>

          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MailCheck className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Check your inbox</h2>
              <p className="text-muted-foreground">We sent a password reset link to <strong>{email}</strong>. Check your email and follow the instructions.</p>
              <Button variant="outline" className="mt-6 w-full" onClick={() => setSent(false)}>
                Try a different email
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <Link href="/" className="flex items-center gap-2 mb-6">
                  <div className="bg-primary rounded-lg p-1.5 font-bold text-white text-sm w-8 h-8 flex items-center justify-center">TF</div>
                  <span className="font-bold text-lg">TutorFinder</span>
                </Link>
                <h1 className="text-2xl font-extrabold">Forgot your password?</h1>
                <p className="text-muted-foreground mt-2 text-sm">No worries. Enter your email and we'll send a reset link.</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className="h-11" />
                </div>
                <Button type="submit" className="w-full h-11 font-semibold" disabled={loading}>
                  {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending...</> : "Send Reset Link"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
