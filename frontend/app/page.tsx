"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getFirstRoute } from "@/lib/auth";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(getFirstRoute());
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0F1C] text-[#7F93B3]">
      Loading ComfortSense...
    </div>
  );
}
