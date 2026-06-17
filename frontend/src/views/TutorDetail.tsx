import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/services/api";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRequests } from "@/context/RequestContext";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Star,
  ShieldCheck,
  MapPin,
  BookOpen,
  GraduationCap,
  Clock,
  Calendar,
  Award,
  CheckCircle2,
  ChevronLeft,
  MessageSquare,
  Wifi,
  Home,
} from "lucide-react";
import { AvailabilitySlot } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function TutorDetail() {
  const params = useParams();
  const id = params?.id as string;
  const { user } = useAuth();
  const { createRequest } = useRequests();
  const { toast } = useToast();
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestForm, setRequestForm] = useState({
    subject: "",
    level: "",
    mode: "online" as "online" | "home",
    message: "",
    fee: 0,
    homeCity: "",
    homeFullAddress: "",
  });
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(
    null,
  );
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [requestLoading, setRequestLoading] = useState(false);

  const handleSendRequest = async () => {
    if (!tutor || !user) return;
    if (!selectedCourse) {
      toast({ title: "Please select a course first", variant: "destructive" });
      return;
    }
    if (!requestForm.message) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    if (!selectedSlot) {
      toast({ title: "Please select a time slot", variant: "destructive" });
      return;
    }
    if (
      requestForm.mode === "home" &&
      (!requestForm.homeCity || !requestForm.homeFullAddress)
    ) {
      toast({
        title: "Please provide your home address",
        variant: "destructive",
      });
      return;
    }
    setRequestLoading(true);
    try {
      await createRequest({
        tutorId: tutor.userId,
        ...(selectedCourse
          ? { courseId: selectedCourse.id || selectedCourse._id?.toString() }
          : {}),
        subject: requestForm.subject,
        level: requestForm.level,
        mode: requestForm.mode,
        selectedSlot,
        ...(requestForm.mode === "home"
          ? {
              homeAddress: {
                city: requestForm.homeCity,
                fullAddress: requestForm.homeFullAddress,
              },
            }
          : {}),
        message: requestForm.message,
        fee: requestForm.fee,
      });
      toast({ title: "Request sent! The tutor will review it shortly." });
      setRequestOpen(false);
      setSelectedSlot(null);
    } catch (err: any) {
      toast({
        title: err?.response?.data?.message || "Failed to send request",
        variant: "destructive",
      });
    } finally {
      setRequestLoading(false);
    }
  };

  const handleOpenRequest = () => {
    setSelectedCourse(null);
    setSelectedSlot(null);
    setRequestForm({
      subject: "",
      level: "",
      mode: "online",
      message: "",
      fee: tutor?.hourlyRate || 0,
      homeCity: "",
      homeFullAddress: "",
    });
    setRequestOpen(true);
  };

  const handleSelectCourse = (course: any) => {
    const defaultMode: "online" | "home" =
      course.mode === "home" ? "home" : "online";
    setSelectedCourse(course);
    setSelectedSlot(null);
    setRequestForm((f) => ({
      ...f,
      subject: course.subject,
      level: course.level,
      fee: course.fee,
      mode: defaultMode,
    }));
  };

  const {
    data: tutor,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["tutor", id],
    queryFn: async () => {
      const { data } = await api.get(`/tutors/${id}`);
      return data.data?.tutor || data.data || data;
    },
    enabled: !!id,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-24 w-24 bg-muted rounded-full mb-4"></div>
          <div className="h-6 w-48 bg-muted rounded mb-2"></div>
          <div className="h-4 w-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (isError || !tutor) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Tutor not found</h2>
        <p className="text-muted-foreground mb-8">
          The tutor profile you're looking for doesn't exist or has been
          removed.
        </p>
        <Link href="/tutors">
          <Button>Back to Tutors</Button>
        </Link>
      </div>
    );
  }

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2);

  return (
    <div className="bg-muted/10 min-h-screen pb-20">
      {/* Header Banner */}
      <div className="bg-secondary text-secondary-foreground pt-12 pb-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="container mx-auto relative z-10">
          <Link
            href="/tutors"
            className="inline-flex items-center text-sm font-medium text-secondary-foreground/70 hover:text-white mb-8 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Search
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border/50 shadow-lg">
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background shadow-sm bg-white">
                    <AvatarImage
                      src={tutor.avatarUrl}
                      alt={tutor.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-3xl bg-primary/10 text-primary font-bold">
                      {getInitials(tutor.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 w-full">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-3">
                      <div>
                        <h1 className="text-3xl font-extrabold flex items-center gap-2 mb-1">
                          {tutor.name}
                          {tutor.verified && (
                            <ShieldCheck className="h-6 w-6 text-primary shrink-0" />
                          )}
                        </h1>
                        <p className="text-lg text-muted-foreground flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" /> {tutor.city}
                        </p>
                      </div>

                      <div className="flex gap-2 shrink-0">
                        {tutor.online && (
                          <Badge
                            variant="outline"
                            className="border-primary/30 text-primary bg-primary/5 py-1.5"
                          >
                            Online Classes
                          </Badge>
                        )}
                        {tutor.homeVisit && (
                          <Badge
                            variant="outline"
                            className="border-amber-500/30 text-amber-600 bg-amber-500/5 py-1.5"
                          >
                            Home Visit
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-6">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md">
                          <Star className="h-4 w-4 fill-current mr-1" />
                          <span className="font-bold text-amber-600">
                            {(tutor.rating || 0).toFixed(1)}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground underline decoration-dotted cursor-pointer">
                          {tutor.reviewCount || 0} Reviews
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Award className="h-4 w-4 text-primary" />
                        <span className="font-medium">
                          {tutor.experience} Years Experience
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="my-8" />

                <div>
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    About Me
                  </h2>
                  <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground">
                    {(tutor.bio || "")
                      .split("\n")
                      .map((paragraph: string, idx: number) => (
                        <p key={idx}>{paragraph}</p>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  Teaching Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Education Level
                  </h3>
                  <Badge
                    variant="secondary"
                    className="text-base px-3 py-1 font-medium bg-secondary/10"
                  >
                    {tutor.level}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Subjects Offered
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(tutor.subjects || []).map((subject: string) => (
                      <Badge
                        key={subject}
                        variant="outline"
                        className="text-sm px-3 py-1 border-primary/20 bg-background"
                      >
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>

                {tutor.education && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      Education Background
                    </h3>
                    <p className="flex items-start gap-2">
                      <Award className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <span>{tutor.education}</span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar CTA — Desktop only */}
          <div className="hidden lg:block lg:col-span-1 space-y-6">
            <Card className="border-primary/20 shadow-lg sticky top-24">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <p className="text-sm text-muted-foreground mb-1">
                    {tutor.courses?.length ? "Starting from" : "Hourly Rate"}
                  </p>
                  <div className="text-4xl font-extrabold text-foreground mb-2">
                    Rs.
                    {tutor.courses?.length
                      ? Math.min(
                          ...(tutor.courses as any[]).map((c: any) => c.fee),
                        )
                      : tutor.hourlyRate}
                    <span className="text-lg font-normal text-muted-foreground">
                      /hr
                    </span>
                  </div>
                  <p className="text-sm text-primary flex items-center justify-center gap-1 font-medium">
                    <CheckCircle2 className="h-4 w-4" /> First 2 days trial is
                    free!
                  </p>
                </div>

                {tutor.availability &&
                  (tutor.availability.online?.length > 0 ||
                    tutor.availability.home?.length > 0) && (
                    <div className="bg-muted/50 rounded-lg p-4 mb-6">
                      <h4 className="font-semibold flex items-center gap-2 mb-2 text-sm">
                        <Calendar className="h-4 w-4 text-primary" />
                        Availability
                      </h4>
                      <div className="space-y-1">
                        {(["online", "home"] as const).map((mode) => {
                          const slots = tutor.availability[mode] || [];
                          if (!slots.length) return null;
                          return slots.map((s: any, i: number) => (
                            <p
                              key={`${mode}-${i}`}
                              className="text-sm text-muted-foreground flex items-center gap-2"
                            >
                              <Clock className="h-3.5 w-3.5 shrink-0" />
                              <span className="capitalize font-medium">
                                {mode}
                              </span>
                              {s.day} · {s.startTime}–{s.endTime}
                            </p>
                          ));
                        })}
                      </div>
                    </div>
                  )}

                <div className="space-y-3">
                  <Button
                    size="lg"
                    className="w-full text-md h-12 shadow-md"
                    onClick={handleOpenRequest}
                    disabled={!user || user.role !== "student"}
                  >
                    Request Free Trial
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full h-12"
                    disabled
                  >
                    Message Tutor
                  </Button>
                </div>

                <div className="mt-6 text-center text-xs text-muted-foreground flex flex-col gap-2">
                  <div className="flex justify-center items-center gap-1">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span>Verified by TutorFinder team</span>
                  </div>
                  <p>100% secure payment after trial</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/60 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 py-3 safe-area-bottom">
        <div className="flex items-center gap-3 max-w-xl mx-auto">
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold">
                Rs.
                {tutor.courses?.length
                  ? Math.min(...(tutor.courses as any[]).map((c: any) => c.fee))
                  : tutor.hourlyRate}
              </span>
              <span className="text-xs text-muted-foreground">/hr</span>
            </div>
            <p className="text-xs text-primary font-medium flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> 2-day trial is free
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 h-11 px-4 gap-1.5"
          >
            <MessageSquare className="h-4 w-4" />
            Chat
          </Button>
          <Button
            size="sm"
            className="shrink-0 h-11 px-5 font-semibold shadow-md shadow-primary/20"
            onClick={handleOpenRequest}
            disabled={!user || user.role !== "student"}
          >
            Request Trial
          </Button>
        </div>
      </div>

      {/* Spacer so content isn't hidden behind mobile sticky bar */}
      <div className="lg:hidden h-20" />

      {/* Request Dialog */}
      <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Send Request to {tutor?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {/* Step 1: Course Picker */}
            {(tutor?.courses?.length ?? 0) > 0 ? (
              <div className="space-y-2">
                <Label className="font-semibold">Select a Course</Label>
                <div className="grid gap-2">
                  {(tutor.courses as any[]).map((course: any) => {
                    const cid = course.id || course._id?.toString();
                    const active =
                      selectedCourse &&
                      (selectedCourse.id || selectedCourse._id?.toString()) ===
                        cid;
                    return (
                      <button
                        key={cid}
                        type="button"
                        onClick={() => handleSelectCourse(course)}
                        className={`w-full text-left flex items-start gap-3 px-4 py-3 rounded-xl border transition-all ${
                          active
                            ? "bg-primary/10 border-primary"
                            : "bg-muted/30 border-border hover:bg-muted"
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <p
                            className={`font-medium text-sm truncate ${active ? "text-primary" : ""}`}
                          >
                            {course.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {course.subject} · {course.level} · Rs. {course.fee}
                            /hr
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border capitalize shrink-0 ${
                            active
                              ? "bg-primary/20 border-primary/30 text-primary"
                              : "bg-muted border-border text-muted-foreground"
                          }`}
                        >
                          {course.mode}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                This tutor hasn't listed any courses yet.
              </p>
            )}

            {/* Step 2: Mode picker — only if course supports both */}
            {selectedCourse?.mode === "both" && (
              <div className="space-y-2">
                <Label className="font-semibold">Session Mode</Label>
                <div className="flex gap-3">
                  {(["online", "home"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setRequestForm((f) => ({ ...f, mode: m }));
                        setSelectedSlot(null);
                      }}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                        requestForm.mode === m
                          ? "bg-primary text-white border-primary"
                          : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                      }`}
                    >
                      {m === "online" ? (
                        <Wifi className="h-4 w-4" />
                      ) : (
                        <Home className="h-4 w-4" />
                      )}
                      {m === "online" ? "Online" : "Home Tuition"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Slot Picker — from selected course */}
            {selectedCourse && (
              <div className="space-y-2">
                <Label className="font-semibold flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-primary" /> Select a Time Slot
                </Label>
                {(() => {
                  const slots: AvailabilitySlot[] =
                    selectedCourse?.availability?.[requestForm.mode] || [];
                  if (slots.length === 0)
                    return (
                      <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                        No {requestForm.mode} slots available for this course
                        yet.
                      </p>
                    );
                  return (
                    <div className="grid gap-2">
                      {slots.map((slot: AvailabilitySlot, i: number) => {
                        const active =
                          selectedSlot?.day === slot.day &&
                          selectedSlot?.startTime === slot.startTime &&
                          selectedSlot?.endTime === slot.endTime;
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm text-left transition-all ${
                              active
                                ? "bg-primary/10 border-primary text-primary font-medium"
                                : "bg-muted/30 border-border hover:bg-muted"
                            }`}
                          >
                            <Clock className="h-3.5 w-3.5 shrink-0" />
                            <span className="font-medium">{slot.day}</span>
                            <span className="text-muted-foreground">
                              {slot.startTime} – {slot.endTime}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Subject / Level — auto-filled from course, still editable */}
            {selectedCourse && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input
                    placeholder="e.g. Mathematics"
                    value={requestForm.subject}
                    onChange={(e) =>
                      setRequestForm((f) => ({ ...f, subject: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Level</Label>
                  <Select
                    value={requestForm.level}
                    onValueChange={(v) =>
                      setRequestForm((f) => ({ ...f, level: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "Primary",
                        "Middle",
                        "Matriculation",
                        "Intermediate",
                        "O Levels",
                        "A Levels",
                        "University",
                      ].map((l) => (
                        <SelectItem key={l} value={l}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Home Address (only for home mode) */}
            {requestForm.mode === "home" && (
              <div className="space-y-3 border border-amber-200 bg-amber-50/50 rounded-xl p-4">
                <Label className="font-semibold flex items-center gap-1.5 text-amber-800">
                  <Home className="h-4 w-4" /> Your Home Address
                </Label>
                <div className="space-y-2">
                  <Label className="text-xs">City</Label>
                  <Select
                    value={requestForm.homeCity}
                    onValueChange={(v) =>
                      setRequestForm((f) => ({ ...f, homeCity: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {(tutor?.homeTuitionCities?.length
                        ? tutor.homeTuitionCities
                        : ["Lahore", "Islamabad", "Karachi"]
                      ).map((c: string) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Full Address</Label>
                  <Input
                    placeholder="e.g. House 12, Street 5, DHA Phase 2"
                    value={requestForm.homeFullAddress}
                    onChange={(e) =>
                      setRequestForm((f) => ({
                        ...f,
                        homeFullAddress: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Proposed Fee (Rs./hr)</Label>
                <Input
                  disabled
                  type="number"
                  min={0}
                  value={requestForm.fee || ""}
                  onChange={(e) =>
                    setRequestForm((f) => ({ ...f, fee: +e.target.value }))
                  }
                  placeholder={String(tutor?.hourlyRate || "")}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                rows={3}
                value={requestForm.message}
                onChange={(e) =>
                  setRequestForm((f) => ({ ...f, message: e.target.value }))
                }
                placeholder="Introduce yourself and describe what you need help with..."
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setRequestOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendRequest} disabled={requestLoading}>
                {requestLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Request"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
