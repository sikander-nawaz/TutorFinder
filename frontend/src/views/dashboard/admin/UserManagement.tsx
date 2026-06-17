import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { adminService } from "@/services/adminService";
import { User } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ShieldOff, ShieldCheck, Loader2, Users } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>(
    {},
  );
  const { toast } = useToast();

  useEffect(() => {
    adminService
      .getUsers()
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleBlock = async (user: User) => {
    setActionLoading((prev) => ({ ...prev, [user.id]: true }));
    try {
      if (user.isBlocked) {
        await adminService.unblockUser(user.id);
        toast({ title: `${user.name} unblocked` });
      } else {
        await adminService.blockUser(user.id);
        toast({ title: `${user.name} blocked` });
      }
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, isBlocked: !u.isBlocked } : u,
        ),
      );
    } catch {
      toast({ title: "Action failed", variant: "destructive" });
    } finally {
      setActionLoading((prev) => {
        const p = { ...prev };
        delete p[user.id];
        return p;
      });
    }
  };

  const getRoleColor = (role: string) => {
    if (role === "admin")
      return "bg-destructive/10 text-destructive border-destructive/20";
    if (role === "tutor") return "bg-primary/10 text-primary border-primary/20";
    return "bg-blue-50 text-blue-700 border-blue-200";
  };

  return (
    <DashboardLayout title="User Management">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {["all", "student", "tutor"].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${roleFilter === r ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Showing {filtered.length} of {users.length} users
        </p>

        {loading ? (
          <div className="space-y-3">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-1">No users found</h3>
            <p className="text-muted-foreground text-sm">
              Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <Card className="card-glow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/30">
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">
                      User
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3 hidden sm:table-cell">
                      Role
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3 hidden md:table-cell">
                      City
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3 hidden lg:table-cell">
                      Joined
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">
                      Status
                    </th>
                    <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filtered.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-border/50">
                            <AvatarImage src={user.avatarUrl} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                              {user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{user.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 hidden sm:table-cell">
                        <Badge
                          className={`text-xs border capitalize ${getRoleColor(user.role)}`}
                        >
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 hidden md:table-cell text-sm text-muted-foreground">
                        {user.city || "—"}
                      </td>
                      <td className="px-5 py-3 hidden lg:table-cell text-sm text-muted-foreground">
                        {format(new Date(user.createdAt), "MMM d, yyyy")}
                      </td>
                      <td className="px-5 py-3">
                        <Badge
                          className={`text-xs border ${user.isBlocked ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-primary/10 text-primary border-primary/20"}`}
                        >
                          {user.isBlocked ? "Blocked" : "Active"}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`gap-1.5 ${user.isBlocked ? "text-primary hover:text-primary hover:bg-primary/5" : "text-destructive hover:text-destructive hover:bg-destructive/5"}`}
                          onClick={() => handleBlock(user)}
                          disabled={actionLoading[user.id]}
                        >
                          {actionLoading[user.id] ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : user.isBlocked ? (
                            <ShieldCheck className="h-3.5 w-3.5" />
                          ) : (
                            <ShieldOff className="h-3.5 w-3.5" />
                          )}
                          {user.isBlocked ? "Unblock" : "Block"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
