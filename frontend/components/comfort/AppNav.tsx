"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Radio } from "lucide-react";
import { getNavItems } from "@/lib/navigation";
import type { UserRole } from "@/lib/types";
import { useComfortData } from "@/lib/comfort-data";
import { useEffect, useState } from "react";

function NavLink({
  href, label, icon: Icon, active, layout, alertCount,
}: {
  href: string; label: string; icon: React.ComponentType<{ className?: string }>; active: boolean; layout: "sidebar" | "bottom"; alertCount?: number;
}) {
  if (layout === "sidebar") {
    return (
      <Link
        href={href}
        prefetch
        className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
          active ? "bg-gradient-to-r from-[#2B7FE0]/20 to-[#4FB8E8]/10 text-[#4FB8E8] border border-[#4FB8E8]/20" : "text-[#7F93B3] hover:bg-[#0E1C30] hover:text-white"
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon className={`h-5 w-5 shrink-0 ${active ? "text-[#4FB8E8]" : ""}`} />
          {label}
        </div>
        {alertCount !== undefined && alertCount > 0 && !active && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F2545B] text-[10px] font-bold text-white">
            {alertCount}
          </span>
        )}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      prefetch
      className={`relative flex min-w-[4.5rem] flex-col items-center gap-1 px-2 text-[10px] font-semibold uppercase tracking-wide transition-colors ${
        active ? "text-[#4FB8E8]" : "text-[#5A6C8A]"
      }`}
    >
      <div className="relative">
        <Icon className={`h-5 w-5 ${active ? "text-[#4FB8E8]" : "text-[#7F93B3]"}`} />
        {alertCount !== undefined && alertCount > 0 && !active && (
          <span className="absolute -right-1 -top-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-[#F2545B]" />
        )}
      </div>
      <span className="truncate">{label}</span>
    </Link>
  );
}

function useAlertCount(role: UserRole) {
  const { lecturerDashboard, studentHome, adminOverview } = useComfortData();
  const pathname = usePathname();
  const [readAlerts, setReadAlerts] = useState<string[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    let currentAlerts: any[] = [];
    
    if (role === "lecturer") {
      currentAlerts = lecturerDashboard?.alerts ?? [];
    } else if (role === "student") {
      // #NNN: Student ta mulu campus ekema alerts pennanne nathuwa nearestZone eke ewa witharak count gannawa
      const currentZoneId = studentHome?.nearestZone?.id;
      currentAlerts = (studentHome?.studentAlerts ?? []).filter(
        (a: any) => a.zoneId === currentZoneId
      );
    } else if (role === "admin") {
      currentAlerts = adminOverview?.alerts ?? [];
    }
    
    setAlerts(currentAlerts);

    if (pathname.includes("alerts") || pathname.includes("overview")) {
       const currentIds = currentAlerts.map(a => `${a.zoneId}-${a.title}`.toLowerCase());
       const newRead = Array.from(new Set([...readAlerts, ...currentIds]));
       setReadAlerts(newRead);
       localStorage.setItem("readAlerts", JSON.stringify(newRead));
    } else {
       const stored = localStorage.getItem("readAlerts");
       if (stored) setReadAlerts(JSON.parse(stored));
    }
  }, [role, lecturerDashboard, studentHome, adminOverview, pathname]);

  // Read karapu nathi, thama active thiyena alerts gana
  return alerts.filter(a => !readAlerts.includes(`${a.zoneId}-${a.title}`.toLowerCase())).length;
}

export function AppSidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const items = getNavItems(role);
  const activeAlertsCount = useAlertCount(role);

  return (
    <aside className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col lg:border-r lg:border-[#294467]/60 lg:bg-[#0B1220]/95 lg:backdrop-blur-xl xl:w-72">
      <div className="border-b border-[#294467]/60 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#294467]/70 bg-gradient-to-b from-[#0E1C30] to-[#16294A]">
            <Radio className="h-5 w-5 text-[#4FB8E8]" />
          </div>
          <div>
            <p className="font-bold text-white">ComfortSense</p>
            <p className="text-xs capitalize text-[#5A6C8A]">{role} portal</p>
          </div>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-4">
        {items.map(({ href, label, icon }) => (
          <NavLink
            key={href} href={href} label={label} icon={icon} active={pathname === href || pathname.startsWith(`${href}/`)} layout="sidebar"
            alertCount={href.includes("alerts") || href.includes("overview") ? activeAlertsCount : undefined}
          />
        ))}
      </nav>
    </aside>
  );
}

export function AppBottomNav({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const items = getNavItems(role);
  const activeAlertsCount = useAlertCount(role);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#294467]/60 bg-[#0B1220]/95 backdrop-blur-xl lg:hidden">
      <div className="scrollbar-hide flex items-center justify-start gap-1 overflow-x-auto px-2 py-3 sm:justify-around">
        {items.map(({ href, label, icon }) => (
          <NavLink
            key={href} href={href} label={label} icon={icon} active={pathname === href || pathname.startsWith(`${href}/`)} layout="bottom"
            alertCount={href.includes("alerts") || href.includes("overview") ? activeAlertsCount : undefined}
          />
        ))}
      </div>
    </nav>
  );
}