"use client";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import TutorProfilePage from "@/views/dashboard/tutor/TutorProfile";
export default function Page() {
  return <ProtectedRoute roles={["tutor"]}><TutorProfilePage /></ProtectedRoute>;
}
