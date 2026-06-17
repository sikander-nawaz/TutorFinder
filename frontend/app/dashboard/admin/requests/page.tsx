"use client";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import AdminRequests from "@/views/dashboard/admin/AdminRequests";

export default function AdminRequestsPage() {
  return (
    <ProtectedRoute roles={["admin"]}>
      <AdminRequests />
    </ProtectedRoute>
  );
}
