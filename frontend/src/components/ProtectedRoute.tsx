import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Role } from "@/types";
import { Spinner } from "@/components/ui/spinner";

interface Props {
  children: ReactNode;
  roles?: Role[];
  redirectTo?: string;
}

export function ProtectedRoute({ children, roles, redirectTo = "/login" }: Props) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(redirectTo);
    }
    if (!isLoading && user && roles && !roles.includes(user.role)) {
      router.replace("/unauthorized");
    }
  }, [isLoading, user, roles, redirectTo, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="h-10 w-10 text-primary" />
      </div>
    );
  }

  if (!user) return null;

  if (user.isBlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 text-center px-4">
        <div className="text-6xl">🚫</div>
        <h2 className="text-2xl font-bold text-destructive">Account Blocked</h2>
        <p className="text-muted-foreground max-w-sm">Your account has been suspended. Please contact support for assistance.</p>
      </div>
    );
  }

  if (roles && !roles.includes(user.role)) return null;

  return <>{children}</>;
}
