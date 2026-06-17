"use client";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import TutorDashboard from "@/views/dashboard/tutor/TutorDashboard";
export default function Page() {
  return <ProtectedRoute roles={["tutor"]}><TutorDashboard /></ProtectedRoute>;
}
