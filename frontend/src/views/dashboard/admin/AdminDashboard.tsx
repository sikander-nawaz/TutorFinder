import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/DashboardLayout";
import { adminService } from "@/services/adminService";
import { AdminStats } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  Users,
  GraduationCap,
  ClipboardList,
  ShieldCheck,
  TrendingUp,
  MessageCircle,
  ArrowRight,
} from "lucide-react";

const PIE_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444"];

const EMPTY_STATS: AdminStats = {
  totalUsers: 0,
  totalTutors: 0,
  totalStudents: 0,
  totalRequests: 0,
  pendingVerifications: 0,
  activeChats: 0,
  monthlyRevenue: 0,
  revenueData: [],
  requestsByStatus: [],
  userGrowth: [],
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .getStats()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  const s = stats || EMPTY_STATS;

  const statCards = [
    {
      label: "Total Users",
      value: s.totalUsers,
      icon: Users,
      color: "text-blue-600 bg-blue-50",
      change: "+8% this month",
    },
    {
      label: "Tutors",
      value: s.totalTutors,
      icon: GraduationCap,
      color: "text-primary bg-primary/10",
      change: `${s.pendingVerifications} pending`,
    },
    {
      label: "Students",
      value: s.totalStudents,
      icon: Users,
      color: "text-purple-600 bg-purple-50",
      change: "+12% this month",
    },
    {
      label: "Total Requests",
      value: s.totalRequests,
      icon: ClipboardList,
      color: "text-amber-600 bg-amber-50",
      change: "All time",
    },
    {
      label: "Pending Verif.",
      value: s.pendingVerifications,
      icon: ShieldCheck,
      color: "text-red-600 bg-red-50",
      change: "Needs review",
    },
    {
      label: "Active Chats",
      value: s.activeChats,
      icon: MessageCircle,
      color: "text-sky-600 bg-sky-50",
      change: "Right now",
    },
    {
      label: "Monthly Revenue",
      value: `Rs. ${(s.monthlyRevenue / 1000).toFixed(0)}k`,
      icon: TrendingUp,
      color: "text-emerald-600 bg-emerald-50",
      change: "+15% vs last month",
    },
  ];

  return (
    <DashboardLayout title="Admin Analytics">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Platform Overview</h2>
            <p className="text-muted-foreground">
              All key metrics at a glance.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard/admin/verifications">
              {s.pendingVerifications > 0 && (
                <Button
                  variant="outline"
                  className="gap-2 border-amber-200 text-amber-700 hover:bg-amber-50"
                >
                  <ShieldCheck className="h-4 w-4" />
                  {s.pendingVerifications} Pending
                </Button>
              )}
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards
            .slice(0, 4)
            .map(({ label, value, icon: Icon, color, change }) => (
              <Card key={label} className="card-glow">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    {loading ? (
                      <Skeleton className="h-7 w-16" />
                    ) : (
                      <p className="text-2xl font-bold">{value}</p>
                    )}
                  </div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {change}
                  </p>
                </CardContent>
              </Card>
            ))}
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {statCards
            .slice(4)
            .map(({ label, value, icon: Icon, color, change }) => (
              <Card key={label} className="card-glow">
                <CardContent className="p-5 flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    {loading ? (
                      <Skeleton className="h-7 w-16 mb-1" />
                    ) : (
                      <p className="text-2xl font-bold">{value}</p>
                    )}
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{change}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="card-glow lg:col-span-2">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <h3 className="font-semibold text-lg">Revenue Trend</h3>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-60 w-full rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={s.revenueData}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#10b981"
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10b981"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
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
                        "Revenue",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      fill="url(#revGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="card-glow">
            <CardHeader className="pb-2">
              <h3 className="font-semibold text-lg">Requests by Status</h3>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-60 w-full rounded-xl" />
              ) : (
                <div>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={s.requestsByStatus}
                        dataKey="count"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        innerRadius={40}
                      >
                        {s.requestsByStatus.map((_, i) => (
                          <Cell
                            key={i}
                            fill={PIE_COLORS[i % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v: number, name: string) => [v, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1.5 mt-2">
                    {s.requestsByStatus.map((item, i) => (
                      <div
                        key={item.status}
                        className="flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{
                              backgroundColor:
                                PIE_COLORS[i % PIE_COLORS.length],
                            }}
                          />
                          <span className="text-muted-foreground">
                            {item.status}
                          </span>
                        </div>
                        <span className="font-medium">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="card-glow">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <h3 className="font-semibold text-lg">User Growth</h3>
            <Link href="/dashboard/admin/users">
              <Button variant="ghost" size="sm" className="gap-1 text-primary">
                Manage <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-52 w-full rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={s.userGrowth}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
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
                  />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="students"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    name="Students"
                  />
                  <Bar
                    dataKey="tutors"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    name="Tutors"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
