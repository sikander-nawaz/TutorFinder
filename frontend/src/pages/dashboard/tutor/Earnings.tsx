import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { tutorService } from "@/services/tutorService";
import { EarningsSummary } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { DollarSign, TrendingUp, Clock, CheckCircle } from "lucide-react";

export default function Earnings() {
  const [data, setData] = useState<EarningsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tutorService.getEarnings()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: "Total Earned", value: `Rs. ${(data?.totalEarned || 0).toLocaleString()}`, icon: DollarSign, color: "text-primary bg-primary/10" },
    { label: "This Month", value: `Rs. ${(data?.thisMonth || 0).toLocaleString()}`, icon: TrendingUp, color: "text-amber-600 bg-amber-50" },
    { label: "Pending Payouts", value: `Rs. ${(data?.pendingPayouts || 0).toLocaleString()}`, icon: Clock, color: "text-blue-600 bg-blue-50" },
    { label: "Sessions Done", value: data?.completedSessions || 0, icon: CheckCircle, color: "text-purple-600 bg-purple-50" },
  ];

  return (
    <DashboardLayout title="Earnings">
      <div className="space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="card-glow">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  {loading ? <Skeleton className="h-7 w-20 mb-1" /> : <p className="text-xl font-bold">{value}</p>}
                  <p className="text-sm text-muted-foreground">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="card-glow">
          <CardHeader className="pb-2">
            <h3 className="font-semibold text-lg">Monthly Earnings Trend</h3>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64 w-full rounded-xl" />
            ) : !data?.monthlyData?.length ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
                No earnings data yet. Complete sessions to see your trend here.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={data.monthlyData}>
                  <defs>
                    <linearGradient id="earningsGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => [`Rs. ${v.toLocaleString()}`, "Earnings"]} />
                  <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2.5} fill="url(#earningsGrad2)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="card-glow">
          <CardHeader className="pb-2">
            <h3 className="font-semibold text-lg">Sessions per Month</h3>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-48 w-full rounded-xl" />
            ) : !data?.monthlyData?.length ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                No session data yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v: number) => [v, "Sessions"]} />
                  <Bar dataKey="sessions" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
