import { useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { useRequests } from "@/context/RequestContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardList, Clock, CheckCircle, XCircle, GraduationCap, Search, MessageCircle, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { RequestStatus } from "@/types";

const statusConfig: Record<RequestStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  approved: { label: "Approved", color: "bg-blue-100 text-blue-700 border-blue-200", icon: CheckCircle },
  rejected: { label: "Rejected", color: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
  trial: { label: "In Trial", color: "bg-purple-100 text-purple-700 border-purple-200", icon: GraduationCap },
  completed: { label: "Completed", color: "bg-primary/10 text-primary border-primary/20", icon: CheckCircle },
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const { requests, isLoading, fetchStudentRequests } = useRequests();

  useEffect(() => { fetchStudentRequests(); }, []);

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === "pending").length,
    active: requests.filter(r => ["approved", "trial"].includes(r.status)).length,
    completed: requests.filter(r => r.status === "completed").length,
  };

  const recentRequests = requests.slice(0, 5);

  return (
    <DashboardLayout title="Student Dashboard">
      <div className="space-y-8">
        {/* Welcome */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Welcome back, {user?.name?.split(" ")[0]}!</h2>
            <p className="text-muted-foreground">Here's your learning overview.</p>
          </div>
          <Link href="/tutors">
            <Button className="gap-2">
              <Search className="h-4 w-4" />
              Find a Tutor
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Requests", value: stats.total, icon: ClipboardList, color: "text-blue-600 bg-blue-50" },
            { label: "Pending", value: stats.pending, icon: Clock, color: "text-amber-600 bg-amber-50" },
            { label: "Active Sessions", value: stats.active, icon: GraduationCap, color: "text-purple-600 bg-purple-50" },
            { label: "Completed", value: stats.completed, icon: CheckCircle, color: "text-primary bg-primary/10" },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="card-glow">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{isLoading ? <Skeleton className="h-7 w-12" /> : value}</p>
                  <p className="text-sm text-muted-foreground">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Requests */}
        <Card className="card-glow">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <h3 className="font-semibold text-lg">Recent Requests</h3>
            <Link href="/dashboard/student/requests">
              <Button variant="ghost" size="sm" className="gap-1 text-primary">View all <ArrowRight className="h-3.5 w-3.5" /></Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>
            ) : recentRequests.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <ClipboardList className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="font-semibold mb-1">No requests yet</p>
                <p className="text-sm text-muted-foreground mb-4">Send a request to a tutor to get started.</p>
                <Link href="/tutors"><Button size="sm">Browse Tutors</Button></Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentRequests.map(req => {
                  const cfg = statusConfig[req.status];
                  const Icon = cfg.icon;
                  return (
                    <div key={req.id} className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-sm">
                        {req.tutorName.split(" ").map(n => n[0]).join("").substring(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{req.tutorName}</p>
                        <p className="text-xs text-muted-foreground">{req.subject} • {req.mode} • Rs. {req.fee}/hr</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge className={`text-xs border ${cfg.color} gap-1`}>
                          <Icon className="h-3 w-3" />
                          {cfg.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground hidden sm:block">{format(new Date(req.createdAt), "MMM d")}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Link href="/tutors">
            <Card className="card-glow cursor-pointer hover:border-primary/30 transition-colors group">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Find a Tutor</p>
                  <p className="text-sm text-muted-foreground">Browse verified tutors near you</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto group-hover:text-primary transition-colors" />
              </CardContent>
            </Card>
          </Link>
          <Link href="/chat">
            <Card className="card-glow cursor-pointer hover:border-primary/30 transition-colors group">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <MessageCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold">Open Messages</p>
                  <p className="text-sm text-muted-foreground">Chat with your tutors</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto group-hover:text-blue-600 transition-colors" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
