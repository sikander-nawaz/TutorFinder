"use client";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import CourseManager from "@/views/dashboard/tutor/CourseManager";
export default function Page() {
  return <ProtectedRoute roles={["tutor"]}><CourseManager /></ProtectedRoute>;
}
