"use client";

import { useState, useEffect } from "react";
import { useComfortData } from "@/lib/comfort-data";
import { BellRing, X, ArrowRight, TrendingUp } from "lucide-react";
import type { UserRole } from "@/lib/types";
import { usePathname, useRouter } from "next/navigation";

export default function GlobalToast({ role }: { role: UserRole }) {
  const { studentHome, lecturerDashboard, adminOverview } = useComfortData();
  const pathname = usePathname();
  const router = useRouter(); 
  
  const [toastAlert, setToastAlert] = useState<any | null>(null);
  const [isToastExpanded, setIsToastExpanded] = useState(false);

  const COOLDOWN_MS = 5 * 1000; 

  useEffect(() => {
    if (role === "lecturer" && !pathname.includes("/dashboard")) {
      setToastAlert(null);
      return;
    }

    let alerts: any[] = [];
    if (role === "student") alerts = studentHome?.studentAlerts ?? [];
    else if (role === "lecturer") alerts = lecturerDashboard?.alerts ?? [];
    else if (role === "admin") alerts = adminOverview?.alerts ?? [];

    const activeAlert = alerts.find((a: any) => a.severity === "critical" || a.severity === "warning");
    
    if (activeAlert) {
      const signature = activeAlert.id + activeAlert.title;
      const seenToastIds = new Set(JSON.parse(localStorage.getItem('seenToastIds') || '[]'));
      const lastToastTime = parseInt(localStorage.getItem('lastToastTime') || '0');
      const now = Date.now();

      if (!seenToastIds.has(signature) || (now - lastToastTime > COOLDOWN_MS)) {
        setToastAlert(activeAlert);
        setIsToastExpanded(false);
        
        seenToastIds.add(signature);
        localStorage.setItem('seenToastIds', JSON.stringify(Array.from(seenToastIds)));
        localStorage.setItem('lastToastTime', now.toString());
      }
    }
  }, [role, studentHome, lecturerDashboard, adminOverview, pathname]);

  if (!toastAlert) return null;

  const isCritical = toastAlert.severity === "critical";
  const bgClass = isCritical ? "bg-[#F2545B]" : "bg-[#F5A623]";
  const textClass = isCritical ? "text-[#F2545B]" : "text-[#F5A623]";
  const borderClass = isCritical ? "border-[#F2545B]/50" : "border-[#F5A623]/50";
  const shadowClass = isCritical ? "shadow-[0_10px_40px_rgba(242,84,91,0.25)]" : "shadow-[0_10px_40px_rgba(245,166,35,0.25)]";
  const iconBg = isCritical ? "bg-[#F2545B]/20" : "bg-[#F5A623]/20";
  const expandedBg = isCritical ? "bg-[#F2545B]/5" : "bg-[#F5A623]/5";
  const expandedBorder = isCritical ? "border-[#F2545B]/20" : "border-[#F5A623]/20";
  const recBorder = isCritical ? "border-[#F2545B]/30" : "border-[#F5A623]/30";

  return (
    <div className="fixed bottom-24 right-4 z-[100] w-[calc(100%-2rem)] md:w-96 md:bottom-8 md:right-8 animate-in slide-in-from-bottom-10 fade-in duration-300">
      <div className={`rounded-2xl border ${borderClass} bg-[#0B1220]/95 backdrop-blur-xl ${shadowClass} overflow-hidden`}>
        <button 
          onClick={() => setIsToastExpanded(!isToastExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition focus:outline-none"
        >
          <div className="flex items-center gap-3">
            <div className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconBg} ${textClass}`}>
              <BellRing className="h-5 w-5 animate-pulse" />
              <span className={`absolute top-0 right-0 h-2.5 w-2.5 rounded-full ${bgClass} animate-ping`} />
            </div>
            <div className="text-left">
              <p className={`text-[10px] font-bold uppercase tracking-widest ${textClass}`}>{toastAlert.title}</p>
              <p className="text-sm font-bold text-white line-clamp-1">{toastAlert.zoneName}: {toastAlert.message}</p>
            </div>
          </div>
          
          <div 
            onClick={(e) => {
              e.stopPropagation();
              setToastAlert(null);
            }}
            className="p-2 text-[#7F93B3] hover:text-white bg-white/5 rounded-full"
          >
            <X className="h-4 w-4" />
          </div>
        </button>

        {isToastExpanded && (
          <div className={`border-t ${expandedBorder} ${expandedBg} p-4 animate-in slide-in-from-top-2`}>
            <p className="text-sm text-[#E2E8F0] mb-3">{toastAlert.reason}</p>
            
            {toastAlert.recommendation && (
              <div className={`bg-black/40 rounded-xl p-3 border ${recBorder} flex gap-3 items-start`}>
                <ArrowRight className={`h-4 w-4 ${textClass} shrink-0 mt-0.5`} />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-0.5">
                    Suggestion
                  </p>
                  <p className={`text-sm font-semibold ${textClass}`}>{toastAlert.recommendation}</p>
                </div>
              </div>
            )}

            {/* #NNN: Toast eken kelinma Admin Overview ekata yanna button eka */}
            {(role === "admin" || role === "lecturer") && toastAlert.title.toLowerCase().includes("co2") && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setToastAlert(null);
                  router.push(`/admin/overview?zoneId=${toastAlert.zoneId}`);
                }}
                className={`mt-3 w-full flex items-center justify-center gap-2 rounded-lg bg-[#0B1220]/60 hover:bg-[#0B1220] border ${expandedBorder} py-2.5 text-xs font-bold ${textClass} transition`}
              >
                <TrendingUp className="h-4 w-4" /> View Predictive Trend
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}