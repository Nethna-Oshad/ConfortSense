"use client";

import { AppBottomNav, AppSidebar } from "@/components/comfort/AppNav";
import GlobalToast from "@/components/comfort/GlobalToast";
import type { UserRole } from "@/lib/types";
import { usePathname } from "next/navigation"; // #NNN: Pathname ganna import kala

export default function AppShell({
  role,
  children,
  glow = true,
}: {
  role: UserRole;
  children: React.ReactNode;
  glow?: boolean;
}) {
  const pathname = usePathname(); // #NNN: Current URL path eka gannawa
  
  // #NNN: User inne rooms selection page eke da kiyala check karanawa
  const isRoomsPage = pathname === "/lecturer/rooms";

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-white">
      {glow && (
        <>
          <div className="pointer-events-none fixed left-0 top-0 h-72 w-72 rounded-full bg-[#2B7FE0]/10 blur-3xl" />
          <div className="pointer-events-none fixed bottom-0 right-0 h-96 w-96 rounded-full bg-[#4FB8E8]/10 blur-3xl" />
        </>
      )}

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1600px]">
        {/* #NNN: Rooms page eke NEME nam witharak Sidebar eka pennanawa */}
        {!isRoomsPage && <AppSidebar role={role} />}

        <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:pl-0">
          <main className="flex-1 px-4 py-5 sm:px-6 md:px-8 lg:px-10 lg:py-8 pb-24 lg:pb-8">
            {children}
          </main>
        </div>
      </div>

      {/* #NNN: Rooms page eke NEME nam witharak Bottom Nav eka pennanawa (Mobile walata) */}
      {!isRoomsPage && <AppBottomNav role={role} />}
      
      <GlobalToast role={role} />
    </div>
  );
}