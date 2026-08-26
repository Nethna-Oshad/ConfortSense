import type { UserRole } from "@/lib/types";
import {
  Activity,
  Bell,
  Compass,
  Home,
  LayoutDashboard,
  Map,
  Radio,
  Settings,
  Thermometer,
  Users,
} from "lucide-react";

export const NAV_CONFIG: Record<
  UserRole,
  Array<{ href: string; label: string; icon: React.ComponentType<{ className?: string }> }>
> = {
  student: [
    { href: "/student/home", label: "Explorer", icon: Compass },
    { href: "/student/zones", label: "My Zones", icon: Home },
    { href: "/student/map", label: "Map", icon: Map },
    { href: "/student/thermal", label: "Heatmap", icon: Thermometer },
    { href: "/student/alerts", label: "Alerts", icon: Bell },
    { href: "/student/settings", label: "Settings", icon: Settings },
  ],
  lecturer: [
    { href: "/lecturer/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/lecturer/thermal", label: "Thermal", icon: Thermometer },
    { href: "/lecturer/alerts", label: "Alerts", icon: Bell },
    { href: "/lecturer/telemetry", label: "Telemetry", icon: Activity },
    { href: "/lecturer/settings", label: "Settings", icon: Settings },
  ],
  admin: [
    { href: "/admin/overview", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/sensors", label: "Sensors", icon: Radio },
    { href: "/admin/analytics", label: "Analytics", icon: Users },
    { href: "/admin/telemetry", label: "Telemetry", icon: Activity },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ],
};

export function getNavItems(role: UserRole) {
  return NAV_CONFIG[role];
}
