"use client";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import ManageRequests from "@/views/dashboard/tutor/ManageRequests";
export default function Page() {
  return <ProtectedRoute roles={["tutor"]}><ManageRequests /></ProtectedRoute>;
}
