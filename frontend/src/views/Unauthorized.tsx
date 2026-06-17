import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldOff } from "lucide-react";

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldOff className="h-10 w-10 text-destructive" />
        </div>
        <h1 className="text-3xl font-extrabold mb-3 text-destructive">Access Denied</h1>
        <p className="text-muted-foreground mb-8">
          You don't have permission to access this page. Please sign in with an account that has the required role.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button variant="outline">Go to Homepage</Button>
          </Link>
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
