"use client";
import { useEffect, useState, useCallback } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { adminService } from "@/services/adminService";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  Loader2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const SUBJECTS = [
  "Mathematics", "Physics", "Chemistry", "Biology", "English", "Urdu",
  "Computer Science", "Islamiat", "Pakistan Studies", "History",
  "Geography", "Economics", "Accounting", "Business Studies", "Statistics",
];

const LEVELS = [
  "Primary", "Middle", "Matriculation", "Intermediate",
  "O Levels", "A Levels", "University",
];

const MODES = [
  { value: "online", label: "Online" },
  { value: "home", label: "Home Visit" },
  { value: "both", label: "Both" },
];

const EMPTY_FORM = {
  tutorId: "",
  title: "",
  subject: "",
  level: "",
  description: "",
  fee: 0,
  mode: "online" as "online" | "home" | "both",
  duration: "",
};

type Course = {
  id: string;
  tutorId: string;
  tutorName: string;
  title: string;
  subject: string;
  level: string;
  description: string;
  fee: number;
  mode: "online" | "home" | "both";
  duration: string;
  isActive: boolean;
  createdAt: string;
};

type FormState = typeof EMPTY_FORM;

export default function AdminCourses() {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getCourses();
      setCourses(data);
    } catch {
      toast({ title: "Failed to load courses", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditingCourse(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (course: Course) => {
    setEditingCourse(course);
    setForm({
      tutorId: course.tutorId,
      title: course.title,
      subject: course.subject,
      level: course.level,
      description: course.description,
      fee: course.fee,
      mode: course.mode,
      duration: course.duration,
    });
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingCourse) {
        const updated = await adminService.updateCourse(editingCourse.id, {
          title: form.title,
          subject: form.subject,
          level: form.level,
          description: form.description,
          fee: Number(form.fee),
          mode: form.mode,
          duration: form.duration,
        });
        setCourses((prev) =>
          prev.map((c) =>
            c.id === editingCourse.id
              ? { ...c, ...updated, tutorName: c.tutorName }
              : c
          )
        );
        toast({ title: "Course updated" });
      } else {
        const created = await adminService.createCourse({
          ...form,
          fee: Number(form.fee),
        });
        setCourses((prev) => [{ ...created, tutorName: "—" }, ...prev]);
        toast({ title: "Course created" });
        load();
      }
      setDialogOpen(false);
    } catch {
      toast({ title: "Failed to save course", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminService.deleteCourse(deleteTarget.id);
      setCourses((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      toast({ title: "Course deleted" });
    } catch {
      toast({ title: "Failed to delete course", variant: "destructive" });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleToggleActive = async (course: Course) => {
    setTogglingId(course.id);
    try {
      await adminService.updateCourse(course.id, { isActive: !course.isActive });
      setCourses((prev) =>
        prev.map((c) => (c.id === course.id ? { ...c, isActive: !c.isActive } : c))
      );
      toast({ title: `Course ${course.isActive ? "deactivated" : "activated"}` });
    } catch {
      toast({ title: "Failed to toggle course status", variant: "destructive" });
    } finally {
      setTogglingId(null);
    }
  };

  const filtered = courses.filter((c) => {
    const matchSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.tutorName.toLowerCase().includes(search.toLowerCase());
    const matchSubject = subjectFilter === "all" || c.subject === subjectFilter;
    return matchSearch && matchSubject;
  });

  const getModeColor = (mode: string) => {
    if (mode === "online") return "bg-blue-50 text-blue-700 border-blue-200";
    if (mode === "home") return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-purple-50 text-purple-700 border-purple-200";
  };

  return (
    <DashboardLayout title="Course Management">
      <div className="space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title or tutor name..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm min-w-[160px]"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
          >
            <option value="all">All Subjects</option>
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <Button onClick={openCreate} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            Add Course
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          Showing {filtered.length} of {courses.length} courses
        </p>

        {loading ? (
          <div className="space-y-3">
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-1">No courses found</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {search || subjectFilter !== "all"
                ? "Try adjusting your filters."
                : "No courses have been created yet."}
            </p>
            {!search && subjectFilter === "all" && (
              <Button onClick={openCreate} className="gap-2">
                <Plus className="h-4 w-4" /> Add First Course
              </Button>
            )}
          </div>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/30">
                    {["Course", "Subject", "Tutor", "Fee", "Mode", "Status", "Created", "Actions"].map((h) => (
                      <th
                        key={h}
                        className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filtered.map((course) => (
                    <tr key={course.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-sm">{course.title}</p>
                          <p className="text-xs text-muted-foreground">{course.level} · {course.duration}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className="text-xs">{course.subject}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                        {course.tutorName}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium whitespace-nowrap">
                        Rs. {course.fee.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`text-xs border capitalize ${getModeColor(course.mode)}`}>
                          {course.mode === "both" ? "Online + Home" : course.mode === "home" ? "Home Visit" : "Online"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleActive(course)}
                          disabled={togglingId === course.id}
                          className="flex items-center gap-1.5 text-xs font-medium transition-colors"
                        >
                          {togglingId === course.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          ) : course.isActive ? (
                            <ToggleRight className="h-5 w-5 text-emerald-500" />
                          ) : (
                            <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                          )}
                          <span className={course.isActive ? "text-emerald-600" : "text-muted-foreground"}>
                            {course.isActive ? "Active" : "Inactive"}
                          </span>
                        </button>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(course.createdAt), "MMM d, yyyy")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => openEdit(course)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                            onClick={() => setDeleteTarget(course)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCourse ? "Edit Course" : "Add New Course"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 py-2">
            {!editingCourse && (
              <div className="space-y-1.5">
                <Label>Tutor User ID</Label>
                <Input
                  placeholder="MongoDB ObjectId of the tutor"
                  value={form.tutorId}
                  onChange={(e) => setForm((f) => ({ ...f, tutorId: e.target.value }))}
                  required
                />
                <p className="text-xs text-muted-foreground">Find the tutor's ID from the Users page.</p>
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input
                placeholder="e.g. Advanced Mathematics for O-Levels"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Subject</Label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={form.subject}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  required
                >
                  <option value="">Select subject</option>
                  {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Level</Label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={form.level}
                  onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}
                  required
                >
                  <option value="">Select level</option>
                  {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                rows={3}
                placeholder="Describe what this course covers..."
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Fee (Rs.)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.fee}
                  onChange={(e) => setForm((f) => ({ ...f, fee: Number(e.target.value) }))}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Duration</Label>
                <Input
                  placeholder="e.g. 1 hour/session"
                  value={form.duration}
                  onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Mode</Label>
              <div className="flex gap-3">
                {MODES.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, mode: m.value as FormState["mode"] }))}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${
                      form.mode === m.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-input hover:border-primary/50"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingCourse ? "Save Changes" : "Create Course"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.title}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
