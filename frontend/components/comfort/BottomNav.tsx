"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Compass, Home, LayoutDashboard, Radio, Settings, Thermometer, Users } from "lucide-react";
import type { UserRole } from "@/lib/types";

const NAV_CONFIG: Record<
  UserRole,
  Array<{ href: string; label: string; icon: React.ComponentType<{ className?: string }> }>
> = {
  student: [
    { href: "/student/home", label: "Explorer", icon: Compass },
    { href: "/student/zones", label: "My Zones", icon: Home },
    { href: "/student/alerts", label: "Alerts", icon: Bell },
    { href: "/student/settings", label: "Settings", icon: Settings },
  ],
  lecturer: [
    { href: "/lecturer/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/lecturer/thermal", label: "Thermal", icon: Thermometer },
    { href: "/lecturer/alerts", label: "Alerts", icon: Bell },
    { href: "/lecturer/settings", label: "Settings", icon: Settings },
  ],
  admin: [
    { href: "/admin/overview", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/sensors", label: "Sensors", icon: Radio },
    { href: "/admin/analytics", label: "Analytics", icon: Users },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ],
};

export default function BottomNav({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const items = NAV_CONFIG[role];

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t border-[#294467]/60 bg-[#0B1220]/95 px-4 py-3 backdrop-blur-xl">
      <div className="flex items-center justify-around">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 text-[10px] font-semibold uppercase tracking-wide transition-colors ${
                active ? "text-[#4FB8E8]" : "text-[#5A6C8A]"
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? "text-[#4FB8E8]" : "text-[#7F93B3]"}`} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
