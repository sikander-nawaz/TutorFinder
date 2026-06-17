import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard, LogOut, UserCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const location = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const { user, logout } = useAuth();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/tutors", label: "Find a Tutor" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
  ];

  const getDashboardHref = () => {
    if (!user) return "/login";
    if (user.role === "admin") return "/dashboard/admin";
    if (user.role === "tutor") return "/dashboard/tutor";
    return "/dashboard/student";
  };

  const initials = user?.name?.split(" ").map(n => n[0]).join("").substring(0, 2) || "U";

  return (
    <>
      {showAnnouncement && (
        <div className="bg-primary text-primary-foreground text-xs sm:text-sm font-medium py-2 px-4 flex items-center justify-between gap-2">
          <div className="flex-1 text-center leading-snug">
            <span className="hidden sm:inline">Verified tutors in Lahore, Islamabad & Karachi — </span>
            <span className="sm:hidden">Lahore, Islamabad & Karachi — </span>
            2-Day Free Trial, No Commitment
          </div>
          <button
            onClick={() => setShowAnnouncement(false)}
            className="text-primary-foreground/80 hover:text-primary-foreground transition-colors p-1 shrink-0"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 flex h-18 py-3 items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-primary flex items-center justify-center h-10 w-10 rounded-xl shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
              <span className="text-white font-extrabold text-lg tracking-tight">TF</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground">
              Tutor<span className="text-primary">Finder</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 h-full">
            {navLinks.map((link) => {
              const isActive = location === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-semibold transition-colors h-full flex items-center relative ${
                    isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-[-12px] left-0 right-0 h-[2px] bg-primary rounded-t-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link href={getDashboardHref()}>
                  <Button variant="ghost" className="gap-2 font-semibold text-primary hover:text-primary hover:bg-primary/5">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 rounded-full p-1 hover:bg-muted transition-colors">
                      <Avatar className="h-8 w-8 border-2 border-primary/20">
                        <AvatarImage src={user.avatarUrl} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{initials}</AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-3 py-2">
                      <p className="font-semibold text-sm truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={getDashboardHref()} className="cursor-pointer">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        My Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive cursor-pointer">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="font-semibold text-muted-foreground hover:text-foreground">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="font-semibold shadow-lg shadow-primary/20">
                    Get Started Free
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-background p-4">
            <nav className="flex flex-col gap-1 mb-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-base font-semibold py-2.5 px-3 rounded-lg ${
                    location === link.href ? "text-primary bg-primary/5" : "text-muted-foreground hover:bg-muted"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="flex flex-col gap-3 pt-3 border-t border-border/50">
              {user ? (
                <>
                  <Link href={getDashboardHref()} onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full gap-2"><LayoutDashboard className="h-4 w-4" />Dashboard</Button>
                  </Link>
                  <Button variant="outline" className="w-full gap-2 text-destructive border-destructive/20" onClick={() => { logout(); setIsMobileMenuOpen(false); }}>
                    <LogOut className="h-4 w-4" />Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">Sign In</Button>
                  </Link>
                  <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full font-semibold">Get Started Free</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
