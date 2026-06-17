import { useEffect, useState, useRef } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { tutorService } from "@/services/tutorService";
import {
  TutorProfile as TutorProfileType,
  AvailabilitySlot,
  TeachingMode,
} from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Loader2,
  Camera,
  Star,
  ShieldCheck,
  MapPin,
  Plus,
  Trash2,
  Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CITIES = ["Lahore", "Islamabad", "Karachi"];
const LEVELS = [
  "Primary",
  "Middle",
  "Matriculation",
  "Intermediate",
  "O Levels",
  "A Levels",
  "University",
];

export default function TutorProfile() {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<TutorProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    bio: "",
    city: "",
    level: "",
    experience: 0,
    hourlyRate: 0,
    qualification: "",
    subjectsStr: "",
  });
  const [teachingModes, setTeachingModes] = useState<TeachingMode[]>([
    "online",
  ]);
  const [homeCitiesStr, setHomeCitiesStr] = useState("");

  useEffect(() => {
    tutorService
      .getMyProfile()
      .then((p) => {
        setProfile(p);
        setForm({
          bio: p.bio || "",
          city: p.city || "",
          level: p.level || "",
          experience: p.experience,
          hourlyRate: p.hourlyRate,
          qualification: p.qualification || "",
          subjectsStr: p.subjects.join(", "),
        });
        setTeachingModes(
          p.teachingModes?.length
            ? p.teachingModes
            : p.online && p.homeVisit
              ? ["online", "home"]
              : p.homeVisit
                ? ["home"]
                : ["online"],
        );
        setHomeCitiesStr((p.homeTuitionCities || []).join(", "));
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  const toggleMode = (mode: TeachingMode) => {
    setTeachingModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode],
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (teachingModes.length === 0) {
      toast({
        title: "Select at least one teaching mode",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      const subjects = form.subjectsStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const tutoringType =
        teachingModes.length === 2 ? "both" : teachingModes[0];
      const homeTuitionCities = homeCitiesStr
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);

      await tutorService.updateMyProfile({
        bio: form.bio,
        city: form.city,
        levels: form.level ? [form.level] : [],
        experience: form.experience,
        hourlyRate: form.hourlyRate,
        qualification: form.qualification,
        tutoringType,
        teachingModes,
        availability: { online: onlineSlots, home: homeSlots },
        homeTuitionCities,
        subjects,
      });
      toast({ title: "Profile updated successfully" });
    } catch {
      toast({ title: "Failed to update profile", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const avatarUrl = await tutorService.uploadAvatar(file);
      toast({ title: "Avatar uploaded successfully" });
      if (profile) {
        setProfile({ ...profile, avatarUrl });
      }
      if (user && updateProfile) {
        await updateProfile({ ...user, avatarUrl });
      }
    } catch {
      toast({ title: "Failed to upload avatar", variant: "destructive" });
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="My Profile">
        <div className="space-y-4">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-40 w-full rounded-xl" />
            ))}
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout title="My Profile">
        <div className="max-w-2xl space-y-6">
          <Card className="card-glow">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-20 w-20 border-4 border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                      {user?.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2) || "T"}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <h2 className="text-xl font-bold">{user?.name}</h2>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {user?.city || "Not set"}
                  </div>
                  <Badge className="mt-2 bg-amber-100 text-amber-700 border-amber-200 border text-xs">
                    Pending Verification
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-glow">
            <CardHeader className="pb-4">
              <h3 className="font-semibold text-lg">Teaching Profile</h3>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <select
                      className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm"
                      value={form.city}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, city: e.target.value }))
                      }
                    >
                      <option value="">Select city</option>
                      {CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Teaching Level</Label>
                    <select
                      className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm"
                      value={form.level}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, level: e.target.value }))
                      }
                    >
                      <option value="">Select level</option>
                      {LEVELS.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Experience (years)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={form.experience}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, experience: +e.target.value }))
                      }
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hourly Rate (Rs.)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={form.hourlyRate}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, hourlyRate: +e.target.value }))
                      }
                      className="h-11"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Qualification</Label>
                  <Input
                    placeholder="e.g., BS Mathematics, University of Punjab"
                    value={form.qualification}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, qualification: e.target.value }))
                    }
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subjects (comma-separated)</Label>
                  <Input
                    placeholder="Mathematics, Physics, Statistics"
                    value={form.subjectsStr}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, subjectsStr: e.target.value }))
                    }
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bio</Label>
                  <Textarea
                    rows={4}
                    placeholder="Tell students about your teaching style and experience..."
                    value={form.bio}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, bio: e.target.value }))
                    }
                  />
                </div>
                {/* Teaching Modes */}
                <div className="space-y-2 pt-1">
                  <Label className="text-sm font-semibold">
                    Teaching Modes
                  </Label>
                  <div className="flex gap-6">
                    {(["online", "home"] as TeachingMode[]).map((m) => (
                      <div key={m} className="flex items-center gap-2">
                        <Checkbox
                          id={`mode-${m}`}
                          checked={teachingModes.includes(m)}
                          onCheckedChange={() => toggleMode(m)}
                        />
                        <Label
                          htmlFor={`mode-${m}`}
                          className="capitalize cursor-pointer"
                        >
                          {m === "online" ? "Online Sessions" : "Home Tuition"}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Availability Slots — now managed per course */}
                {teachingModes.length > 0 && (
                  <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-xl p-4">
                    <Clock className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Time slots are set per course
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Go to <strong>My Courses</strong> to add availability
                        slots for each course you offer.
                      </p>
                    </div>
                  </div>
                )}

                {/* Home Tuition Cities */}
                {teachingModes.includes("home") && (
                  <div className="space-y-2">
                    <Label>
                      Cities for Home Tuition{" "}
                      <span className="text-xs text-muted-foreground">
                        (comma-separated)
                      </span>
                    </Label>
                    <Input
                      placeholder="e.g. Lahore, Islamabad"
                      value={homeCitiesStr}
                      onChange={(e) => setHomeCitiesStr(e.target.value)}
                      className="h-11"
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const initials =
    profile.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2) || "T";

  return (
    <DashboardLayout title="My Profile">
      <div className="max-w-2xl space-y-6">
        <Card className="card-glow">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-20 w-20 border-4 border-primary/20">
                  <AvatarImage src={profile.avatarUrl} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={handleAvatarClick}
                  disabled={uploadingAvatar}
                  className="absolute bottom-0 right-0 w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Camera className="h-3.5 w-3.5" />
                  )}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold">{profile.name}</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {profile.city}
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                    <span className="font-medium">
                      {profile.rating.toFixed(1)}
                    </span>
                    <span className="text-muted-foreground">
                      ({profile.reviewCount})
                    </span>
                  </div>
                  {profile.verified ? (
                    <Badge className="bg-primary/10 text-primary border-primary/20 border gap-1 text-xs">
                      <ShieldCheck className="h-3 w-3" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200 border text-xs">
                      Pending Verification
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-glow">
          <CardHeader className="pb-4">
            <h3 className="font-semibold text-lg">Teaching Profile</h3>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <select
                    className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm"
                    value={form.city}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, city: e.target.value }))
                    }
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Teaching Level</Label>
                  <select
                    className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm"
                    value={form.level}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, level: e.target.value }))
                    }
                  >
                    {LEVELS.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Experience (years)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.experience}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, experience: +e.target.value }))
                    }
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hourly Rate (Rs.)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.hourlyRate}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, hourlyRate: +e.target.value }))
                    }
                    className="h-11"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Qualification</Label>
                <Input
                  placeholder="e.g., BS Mathematics, University of Punjab"
                  value={form.qualification}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, qualification: e.target.value }))
                  }
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label>Subjects (comma-separated)</Label>
                <Input
                  placeholder="Mathematics, Physics, Statistics"
                  value={form.subjectsStr}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, subjectsStr: e.target.value }))
                  }
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea
                  rows={4}
                  placeholder="Tell students about your teaching style and experience..."
                  value={form.bio}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, bio: e.target.value }))
                  }
                />
              </div>

              {/* Teaching Modes */}
              <div className="space-y-2 pt-1">
                <Label className="text-sm font-semibold">Teaching Modes</Label>
                <div className="flex gap-6">
                  {(["online", "home"] as TeachingMode[]).map((m) => (
                    <div key={m} className="flex items-center gap-2">
                      <Checkbox
                        id={`np-mode-${m}`}
                        checked={teachingModes.includes(m)}
                        onCheckedChange={() => toggleMode(m)}
                      />
                      <Label
                        htmlFor={`np-mode-${m}`}
                        className="capitalize cursor-pointer"
                      >
                        {m === "online" ? "Online Sessions" : "Home Tuition"}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {(["online", "home"] as TeachingMode[])
                .filter((m) => teachingModes.includes(m))
                .map((mode) => {
                  const slots = mode === "online" ? onlineSlots : homeSlots;
                  return (
                    <div
                      key={mode}
                      className="space-y-3 border border-border/50 rounded-xl p-4 bg-muted/20"
                    >
                      <div className="flex items-center justify-between">
                        <Label className="font-semibold flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          {mode === "online" ? "Online" : "Home"} Availability
                          Slots
                        </Label>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="gap-1.5 h-8 text-xs"
                          onClick={() => addSlot(mode)}
                        >
                          <Plus className="h-3.5 w-3.5" /> Add Slot
                        </Button>
                      </div>
                      {slots.length === 0 && (
                        <p className="text-xs text-muted-foreground">
                          No slots yet.
                        </p>
                      )}
                      {slots.map((slot, i) => (
                        <div
                          key={i}
                          className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2"
                        >
                          <select
                            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                            value={slot.day}
                            onChange={(e) =>
                              updateSlot(mode, i, "day", e.target.value)
                            }
                          >
                            {DAYS.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                          <Input
                            type="time"
                            className="h-9 w-28 text-sm"
                            value={slot.startTime}
                            onChange={(e) =>
                              updateSlot(mode, i, "startTime", e.target.value)
                            }
                          />
                          <Input
                            type="time"
                            className="h-9 w-28 text-sm"
                            value={slot.endTime}
                            onChange={(e) =>
                              updateSlot(mode, i, "endTime", e.target.value)
                            }
                          />
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-9 w-9 text-destructive hover:bg-destructive/5"
                            onClick={() => removeSlot(mode, i)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  );
                })}

              {teachingModes.includes("home") && (
                <div className="space-y-2">
                  <Label>
                    Cities for Home Tuition{" "}
                    <span className="text-xs text-muted-foreground">
                      (comma-separated)
                    </span>
                  </Label>
                  <Input
                    placeholder="e.g. Lahore, Islamabad"
                    value={homeCitiesStr}
                    onChange={(e) => setHomeCitiesStr(e.target.value)}
                    className="h-11"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
