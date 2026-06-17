import Link from "next/link";
import {
  Star,
  ShieldCheck,
  MapPin,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { TiltCard } from "@/components/TiltCard";

export function TutorCard({ tutor }: { tutor: any }) {
  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2);

  const rating = tutor.rating ?? 0;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const stars = Array.from({ length: 5 }).map((_, i) => {
    if (i < fullStars) return "full";
    if (i === fullStars && hasHalfStar) return "half";
    return "empty";
  });

  return (
    <TiltCard className="h-full" intensity={8}>
      <div className="glass-card rounded-2xl overflow-hidden flex flex-col group relative h-full">
        <div
          className="h-1 bg-gradient-to-r from-primary via-emerald-400 to-primary w-full absolute top-0 left-0 z-10"
          style={{
            animation: "gradient-shift 3s ease infinite",
            backgroundSize: "200% 100%",
          }}
        />

        <div className="p-6 pb-4 flex-1 flex flex-col pt-7">
          <div className="flex justify-between items-start mb-4">
            <div className="relative">
              <Avatar className="h-16 w-16 border-2 border-background ring-2 ring-primary/20 ring-offset-2 shadow-sm">
                <AvatarImage src={tutor.avatarUrl} alt={tutor.name} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                  {getInitials(tutor.name)}
                </AvatarFallback>
              </Avatar>
              {tutor.verified && (
                <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 shadow-sm">
                  <ShieldCheck className="h-5 w-5 text-emerald-500 fill-emerald-100" />
                </div>
              )}
            </div>
            <div className="glass rounded-full px-3 py-1.5 text-sm font-bold text-primary border border-primary/20 shadow-sm">
              Rs. {tutor.hourlyRate}
              <span className="text-xs font-medium text-primary/70">/hr</span>
            </div>
          </div>

          <div className="mb-3">
            <h3 className="font-extrabold text-xl leading-tight group-hover:text-primary transition-colors">
              {tutor.name}
            </h3>
            <div className="flex items-center text-sm font-medium text-muted-foreground mt-1.5 gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {tutor.city}
            </div>
          </div>

          <div className="flex items-center gap-1.5 mb-4">
            <div className="flex text-amber-400">
              {stars.map((type, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${type === "empty" ? "text-muted-foreground/30" : "fill-current"}`}
                />
              ))}
            </div>
            <span className="font-bold text-sm text-foreground ml-1">
              {rating.toFixed(1)}
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              ({tutor.reviewCount})
            </span>
            <span className="text-muted-foreground text-xs mx-1">•</span>
            <span className="text-xs font-bold text-foreground">
              {tutor.experience}y exp
            </span>
          </div>

          {tutor.bio && (
            <p className="text-sm text-muted-foreground mb-5 line-clamp-2 leading-relaxed">
              {tutor.bio}
            </p>
          )}

          <div className="space-y-3 mt-auto">
            <div className="flex flex-wrap gap-1.5">
              {tutor.subjects.slice(0, 3).map((subject: string) => (
                <Badge
                  key={subject}
                  variant="secondary"
                  className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-full border-none"
                >
                  {subject}
                </Badge>
              ))}
              {tutor.subjects.length > 3 && (
                <Badge
                  variant="secondary"
                  className="bg-muted text-muted-foreground text-xs font-semibold rounded-full border-none"
                >
                  +{tutor.subjects.length - 3}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <GraduationCap className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm font-medium text-foreground/80">
                {tutor.level}
              </span>
            </div>

            <div className="flex gap-2 pt-1">
              {tutor.online && (
                <Badge
                  variant="outline"
                  className="text-[10px] font-bold border-primary/30 text-primary rounded-full px-2"
                >
                  Online
                </Badge>
              )}
              {tutor.homeVisit && (
                <Badge
                  variant="outline"
                  className="text-[10px] font-bold border-amber-500/30 text-amber-600 rounded-full px-2"
                >
                  Home Visit
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="p-5 pt-0 mt-auto flex gap-3">
          <Link href={`/tutors/${tutor.id}`} className="flex-1">
            <Button
              variant="outline"
              className="w-full font-bold border-primary/20 hover:border-primary hover:bg-primary/5 text-primary transition-all duration-200"
            >
              Profile
            </Button>
          </Link>
          <Link href={`/tutors/${tutor.id}?trial=true`} className="flex-1">
            <Button
              variant="default"
              className="w-full font-bold btn-magnetic shadow-md shadow-primary/20"
            >
              Request Trial
            </Button>
          </Link>
        </div>
      </div>
    </TiltCard>
  );
}

export function TutorCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col p-6 h-[400px]">
      <div className="flex justify-between items-start mb-6">
        <Skeleton className="h-16 w-16 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
      <Skeleton className="h-6 w-40 mb-3" />
      <Skeleton className="h-4 w-24 mb-5" />
      <Skeleton className="h-4 w-32 mb-6" />
      <div className="space-y-2 mb-6">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      <div className="flex gap-2 mb-auto">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="flex gap-3 mt-6">
        <Skeleton className="h-10 flex-1 rounded-md" />
        <Skeleton className="h-10 flex-1 rounded-md" />
      </div>
    </div>
  );
}
