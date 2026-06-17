import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  BookOpen,
  MessageCircle,
  ClipboardList,
  TrendingUp,
  Users,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Settings,
  GraduationCap,
  Bell,
  ChevronRight,
  BadgeCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

function getNavItems(role: string): NavItem[] {
  if (role === "student")
    return [
      { label: "Overview", href: "/dashboard/student", icon: LayoutDashboard },
      {
        label: "My Requests",
        href: "/dashboard/student/requests",
        icon: ClipboardList,
      },
      {
        label: "Verification",
        href: "/dashboard/student/verification",
        icon: BadgeCheck,
      },
      { label: "Messages", href: "/chat", icon: MessageCircle },
      { label: "Profile", href: "/dashboard/student/profile", icon: Settings },
    ];
  if (role === "tutor")
    return [
      { label: "Overview", href: "/dashboard/tutor", icon: LayoutDashboard },
      {
        label: "Requests",
        href: "/dashboard/tutor/requests",
        icon: ClipboardList,
      },
      { label: "My Courses", href: "/dashboard/tutor/courses", icon: BookOpen },
      {
        label: "Earnings",
        href: "/dashboard/tutor/earnings",
        icon: TrendingUp,
      },
      {
        label: "Verification",
        href: "/dashboard/tutor/verification",
        icon: BadgeCheck,
      },
      { label: "Messages", href: "/chat", icon: MessageCircle },
      { label: "Profile", href: "/dashboard/tutor/profile", icon: Settings },
    ];
  return [
    { label: "Analytics", href: "/dashboard/admin", icon: LayoutDashboard },
    { label: "Users", href: "/dashboard/admin/users", icon: Users },
    { label: "Courses", href: "/dashboard/admin/courses", icon: BookOpen },
    {
      label: "Verifications",
      href: "/dashboard/admin/verifications",
      icon: ShieldCheck,
    },
    {
      label: "All Requests",
      href: "/dashboard/admin/requests",
      icon: ClipboardList,
    },
  ];
}

export function DashboardLayout({
  children,
  title,
}: {
  children: ReactNode;
  title?: string;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = usePathname();
  const { user, logout } = useAuth();
  const navItems = getNavItems(user?.role || "student");

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2) || "U";
  const roleLabel =
    user?.role === "student"
      ? "Student"
      : user?.role === "tutor"
        ? "Tutor"
        : "Admin";

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border/50">
        <Link href="/" className="flex items-center gap-2 mb-6">
          <div className="bg-primary rounded-lg p-1.5 flex items-center justify-center font-bold text-white text-sm w-8 h-8">
            TF
          </div>
          <span className="font-bold text-lg">
            Tutor<span className="text-primary">Finder</span>
          </span>
        </Link>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50">
          <Avatar className="h-10 w-10 border-2 border-primary/20">
            <AvatarImage src={user?.avatarUrl} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm truncate">{user?.name}</p>
            <Badge
              variant="secondary"
              className="text-xs mt-0.5 bg-primary/10 text-primary border-0"
            >
              {roleLabel}
            </Badge>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
            >
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group cursor-pointer",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    isActive
                      ? "text-white"
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
                />
                <span className="flex-1">{item.label}</span>
                {item.badge ? (
                  <Badge className="h-5 min-w-5 text-xs px-1.5 bg-white/20 text-white border-0">
                    {item.badge}
                  </Badge>
                ) : isActive ? (
                  <ChevronRight className="h-3.5 w-3.5 text-white/70" />
                ) : null}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/50">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-background border-r border-border/50 fixed top-0 left-0 h-screen z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-64 bg-background shadow-2xl z-50">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border/50 px-4 md:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-muted"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            {title && <h1 className="text-lg font-semibold">{title}</h1>}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <Bell className="h-4 w-4" />
            </Button>
            <Link href="/chat">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <MessageCircle className="h-4 w-4" />
              </Button>
            </Link>
            <Avatar className="h-8 w-8 cursor-pointer border-2 border-primary/20">
              <AvatarImage src={user?.avatarUrl} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
