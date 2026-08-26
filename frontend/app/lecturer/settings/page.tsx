"use client";

import { useRouter } from "next/navigation";
import PageHeader from "@/components/comfort/PageHeader";
import { clearAuth, getStoredAuth } from "@/lib/auth";

export default function LecturerSettingsPage() {
  const router = useRouter();
  const user = getStoredAuth();

  return (
    <div className="space-y-4">
      <PageHeader title="Lecturer Settings" backHref="/lecturer/dashboard" backLabel="Back to Dashboard" />
      <div className="max-w-xl rounded-2xl border border-[#294467]/60 bg-[#0E1C30] p-5">
        <p className="text-sm text-[#7F93B3]">Assigned profile</p>
        <p className="mt-1 text-lg font-semibold">{user?.name || "Dr. Morgan"}</p>
        <p className="text-sm text-[#5A6C8A]">{user?.email || "lecturer@university.edu"}</p>
      </div>
      <button
        onClick={() => {
          clearAuth();
          router.push("/login");
        }}
        className="max-w-xl rounded-2xl border border-[#F2545B]/30 bg-[#F2545B]/10 py-3 text-sm font-semibold text-[#F2545B]"
      >
        Logout
      </button>
    </div>
  );
}
