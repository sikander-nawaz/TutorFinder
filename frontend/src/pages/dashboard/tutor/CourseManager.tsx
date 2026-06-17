import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { tutorService } from "@/services/tutorService";
import { Course, TutoringMode, AvailabilitySlot } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Edit3, Trash2, BookOpen, Loader2, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
function emptySlot(): AvailabilitySlot {
  return { day: "Monday", startTime: "09:00", endTime: "10:00" };
}

const LEVELS = [
  "Primary",
  "Middle",
  "Matriculation",
  "Intermediate",
  "O Levels",
  "A Levels",
  "University",
];
const MODES: TutoringMode[] = ["online", "home", "both"];

const emptyForm = {
  title: "",
  subject: "",
  level: "",
  description: "",
  fee: 0,
  mode: "online" as TutoringMode,
  duration: "",
};

function getModesForSlots(mode: TutoringMode): ("online" | "home")[] {
  if (mode === "both") return ["online", "home"];
  return [mode as "online" | "home"];
}

export default function CourseManager() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [onlineSlots, setOnlineSlots] = useState<AvailabilitySlot[]>([]);
  const [homeSlots, setHomeSlots] = useState<AvailabilitySlot[]>([]);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  const addSlot = (mode: "online" | "home") => {
    if (mode === "online") setOnlineSlots((s) => [...s, emptySlot()]);
    else setHomeSlots((s) => [...s, emptySlot()]);
  };
  const removeSlot = (mode: "online" | "home", i: number) => {
    if (mode === "online")
      setOnlineSlots((s) => s.filter((_, idx) => idx !== i));
    else setHomeSlots((s) => s.filter((_, idx) => idx !== i));
  };
  const updateSlot = (
    mode: "online" | "home",
    i: number,
    field: keyof AvailabilitySlot,
    value: string,
  ) => {
    const up = (slots: AvailabilitySlot[]) =>
      slots.map((s, idx) => (idx === i ? { ...s, [field]: value } : s));
    if (mode === "online") setOnlineSlots(up);
    else setHomeSlots(up);
  };

  const fetch = async () => {
    setLoading(true);
    try {
      const data = await tutorService.getMyCourses();
      setCourses(data);
    } catch {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const openAdd = () => {
    setEditingCourse(null);
    setForm(emptyForm);
    setOnlineSlots([]);
    setHomeSlots([]);
    setShowModal(true);
  };
  const openEdit = (c: Course) => {
    setEditingCourse(c);
    setForm({
      title: c.title,
      subject: c.subject,
      level: c.level,
      description: c.description,
      fee: c.fee,
      mode: c.mode,
      duration: c.duration,
    });
    setOnlineSlots(c.availability?.online || []);
    setHomeSlots(c.availability?.home || []);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.subject)
      return toast({
        title: "Please fill in required fields",
        variant: "destructive",
      });
    setSaving(true);
    try {
      const payload = {
        ...form,
        availability: { online: onlineSlots, home: homeSlots },
      };
      if (editingCourse) {
        const updated = await tutorService.updateCourse(
          editingCourse.id,
          payload,
        );
        setCourses((prev) =>
          prev.map((c) => (c.id === editingCourse.id ? updated : c)),
        );
        toast({ title: "Course updated" });
      } else {
        const created = await tutorService.createCourse(payload);
        setCourses((prev) => [created, ...prev]);
        toast({ title: "Course created" });
      }
      setShowModal(false);
    } catch {
      toast({ title: "Failed to save course", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await tutorService.deleteCourse(id);
      setCourses((prev) => prev.filter((c) => c.id !== id));
      toast({ title: "Course deleted" });
    } catch {
      toast({ title: "Failed to delete course", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DashboardLayout title="My Courses">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">
            {courses.length} course{courses.length !== 1 ? "s" : ""} listed
          </p>
          <Button onClick={openAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Course
          </Button>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-48 w-full rounded-xl" />
              ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-1">No courses yet</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Add your first course to attract students.
            </p>
            <Button onClick={openAdd} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Course
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {courses.map((course) => (
              <Card key={course.id} className="card-glow">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <h3 className="font-semibold leading-tight">
                      {course.title}
                    </h3>
                    <div className="flex gap-1.5 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={() => openEdit(course)}
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(course.id)}
                        disabled={deletingId === course.id}
                      >
                        {deletingId === course.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <Badge variant="secondary" className="text-xs">
                      {course.subject}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {course.level}
                    </Badge>
                    <Badge variant="outline" className="text-xs capitalize">
                      {course.mode}
                    </Badge>
                  </div>
                  {course.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {course.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-primary">
                      Rs. {course.fee}/hr
                    </span>
                    {course.duration && (
                      <span className="text-muted-foreground">
                        {course.duration}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCourse ? "Edit Course" : "Add New Course"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>
                Course Title <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="e.g., Advanced Mathematics for O-Levels"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>
                  Subject <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="e.g., Mathematics"
                  value={form.subject}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, subject: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Level</Label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
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
                <Label>Fee (Rs./hr)</Label>
                <Input
                  type="number"
                  placeholder="2000"
                  value={form.fee || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, fee: +e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Mode</Label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={form.mode}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      mode: e.target.value as TutoringMode,
                    }))
                  }
                >
                  {MODES.map((m) => (
                    <option key={m} value={m} className="capitalize">
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Duration</Label>
              <Input
                placeholder="e.g., 1 hour/day"
                value={form.duration}
                onChange={(e) =>
                  setForm((f) => ({ ...f, duration: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                rows={3}
                placeholder="What will students learn in this course?"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>
            {/* Availability Slots per mode */}
            {getModesForSlots(form.mode).map((mode) => {
              const slots = mode === "online" ? onlineSlots : homeSlots;
              return (
                <div
                  key={mode}
                  className="space-y-2 border border-border/50 rounded-xl p-4 bg-muted/20"
                >
                  <div className="flex items-center justify-between">
                    <Label className="font-semibold flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      {mode === "online" ? "Online" : "Home"} Time Slots
                    </Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1"
                      onClick={() => addSlot(mode)}
                    >
                      <Plus className="h-3 w-3" /> Add
                    </Button>
                  </div>
                  {slots.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      No slots yet. Students won't see any time options for this
                      mode.
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

            <div className="flex gap-3 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : editingCourse ? (
                  "Update Course"
                ) : (
                  "Create Course"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
