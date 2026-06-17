"use client";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import UserManagement from "@/views/dashboard/admin/UserManagement";
export default function Page() {
  return <ProtectedRoute roles={["admin"]}><UserManagement /></ProtectedRoute>;
}
