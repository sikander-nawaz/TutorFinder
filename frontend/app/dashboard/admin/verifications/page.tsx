"use client";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import TutorVerification from "@/views/dashboard/admin/TutorVerification";
export default function Page() {
  return <ProtectedRoute roles={["admin"]}><TutorVerification /></ProtectedRoute>;
}
