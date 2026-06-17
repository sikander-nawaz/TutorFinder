import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { useRequests } from "@/context/RequestContext";
import { tutorService } from "@/services/tutorService";
import { EarningsSummary } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  DollarSign,
  Clock,
  CheckCircle,
  Users,
  ArrowRight,
  TrendingUp,
  BookOpen,
} from "lucide-react";

export default function TutorDashboard() {
  const { user } = useAuth();
  const { requests, isLoading: reqLoading, fetchTutorRequests } = useRequests();
  const [earnings, setEarnings] = useState<EarningsSummary | null>(null);
  const [earningsLoading, setEarningsLoading] = useState(true);

  useEffect(() => {
    fetchTutorRequests();
    tutorService
      .getEarnings()
      .then(setEarnings)
      .catch(() => setEarnings(null))
      .finally(() => setEarningsLoading(false));
  }, []);

  const pendingRequests = (requests || []).filter(
    (r) => r.status === "pending",
  );
  const activeRequests = (requests || []).filter((r) =>
    ["approved", "trial"].includes(r.status),
  );

  return (
    <DashboardLayout title="Tutor Dashboard">
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">
              Welcome back, {user?.name?.split(" ")[0]}!
            </h2>
            <p className="text-muted-foreground">
              Here's your teaching overview.
            </p>
          </div>
          <Link href="/dashboard/tutor/requests">
            <Button className="gap-2">
              <Clock className="h-4 w-4" />
              {pendingRequests.length > 0
                ? `${pendingRequests.length} Pending Requests`
                : "View Requests"}
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Earned",
              value: earningsLoading
                ? null
                : `Rs. ${(earnings?.totalEarned || 0).toLocaleString()}`,
              icon: DollarSign,
              color: "text-primary bg-primary/10",
            },
            {
              label: "This Month",
              value: earningsLoading
                ? null
                : `Rs. ${(earnings?.thisMonth || 0).toLocaleString()}`,
              icon: TrendingUp,
              color: "text-amber-600 bg-amber-50",
            },
            {
              label: "Pending Requests",
              value: reqLoading ? null : pendingRequests.length,
              icon: Clock,
              color: "text-blue-600 bg-blue-50",
            },
            {
              label: "Active Students",
              value: reqLoading ? null : activeRequests.length,
              icon: Users,
              color: "text-purple-600 bg-purple-50",
            },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="card-glow">
              <CardContent className="p-5 flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  {value === null ? (
                    <Skeleton className="h-7 w-16 mb-1" />
                  ) : (
                    <p className="text-2xl font-bold">{value}</p>
                  )}
                  <p className="text-sm text-muted-foreground">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Earnings Chart */}
        <Card className="card-glow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <h3 className="font-semibold text-lg">Monthly Earnings</h3>
            <Link href="/dashboard/tutor/earnings">
              <Button variant="ghost" size="sm" className="gap-1 text-primary">
                Full Report <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {earningsLoading ? (
              <Skeleton className="h-48 w-full rounded-xl" />
            ) : !earnings?.monthlyData?.length ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                No earnings data yet. Start teaching to see your earnings here.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={earnings.monthlyData}>
                  <defs>
                    <linearGradient
                      id="earningsGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(v: number) => [
                      `Rs. ${v.toLocaleString()}`,
                      "Earnings",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#earningsGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Pending Requests */}
        <Card className="card-glow">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <h3 className="font-semibold text-lg">Pending Requests</h3>
            <Link href="/dashboard/tutor/requests">
              <Button variant="ghost" size="sm" className="gap-1 text-primary">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {reqLoading ? (
              <div className="space-y-3">
                {Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-xl" />
                  ))}
              </div>
            ) : pendingRequests.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  No pending requests. All caught up!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.slice(0, 3).map((req) => (
                  <div
                    key={req.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50"
                  >
                    <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 font-bold text-sm flex items-center justify-center shrink-0">
                      {req.studentName
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .substring(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{req.studentName}</p>
                      <p className="text-xs text-muted-foreground">
                        {req.subject} • Rs. {req.fee}/hr
                      </p>
                    </div>
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs border">
                      Pending
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Link href="/dashboard/tutor/courses">
            <Card className="card-glow cursor-pointer hover:border-primary/30 transition-colors group">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Manage Courses</p>
                  <p className="text-sm text-muted-foreground">
                    Add or edit your course offerings
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto group-hover:text-primary transition-colors" />
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/tutor/earnings">
            <Card className="card-glow cursor-pointer hover:border-primary/30 transition-colors group">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                  <TrendingUp className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold">Earnings Report</p>
                  <p className="text-sm text-muted-foreground">
                    View detailed earnings analytics
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto group-hover:text-amber-600 transition-colors" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
