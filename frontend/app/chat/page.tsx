"use client";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Chat from "@/views/Chat";
export default function Page() {
  return <ProtectedRoute><Chat /></ProtectedRoute>;
}
