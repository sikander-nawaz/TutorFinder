"use client";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import StudentDashboard from "@/views/dashboard/student/StudentDashboard";
export default function Page() {
  return <ProtectedRoute roles={["student"]}><StudentDashboard /></ProtectedRoute>;
}
