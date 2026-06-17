"use client";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import AdminDashboard from "@/views/dashboard/admin/AdminDashboard";
export default function Page() {
  return <ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>;
}
