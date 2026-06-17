"use client";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Earnings from "@/views/dashboard/tutor/Earnings";
export default function Page() {
  return <ProtectedRoute roles={["tutor"]}><Earnings /></ProtectedRoute>;
}
