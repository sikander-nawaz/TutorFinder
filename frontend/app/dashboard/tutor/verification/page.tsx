"use client";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import VerificationStatus from "@/views/dashboard/tutor/VerificationStatus";
export default function Page() {
  return <ProtectedRoute roles={["tutor"]}><VerificationStatus /></ProtectedRoute>;
}
