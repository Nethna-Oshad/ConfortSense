"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/comfort/PageHeader";
import { useComfortData } from "@/lib/comfort-data";
import { AlertTriangle, AlertOctagon, Info, Clock, CheckCircle2, MapPin, ArrowRight } from "lucide-react";

export default function StudentAlertsPage() {
  const { studentHome, ready } = useComfortData();
  const rawAlerts = studentHome?.studentAlerts ?? [];

  const [alertHistory, setAlertHistory] = useState<any[]>([]);

  useEffect(() => {
    if (rawAlerts.length > 0) {
      setAlertHistory((prev) => {
        const newHistory = [...prev];
        let changed = false;
        
        rawAlerts.forEach((alert: any) => {
          // #NNN: Prevent duplicate alerts for the same zone and title
          const exists = newHistory.some((h) => h.zoneId === alert.zoneId && h.title === alert.title && h.message === alert.message);
          if (!exists) {
            newHistory.unshift({ ...alert, uniqueKey: Date.now() + Math.random() });
            changed = true;
          }
        });
        
        return changed ? newHistory.slice(0, 30) : prev;
      });
    }
  }, [rawAlerts]);

  const getAlertStyles = (severity?: string) => {
    switch (severity) {
      case "critical": return { bg: "bg-[#F2545B]/15", border: "border-[#F2545B]/40", text: "text-[#F2545B]", Icon: AlertOctagon };
      case "warning": return { bg: "bg-[#F5A623]/15", border: "border-[#F5A623]/40", text: "text-[#F5A623]", Icon: AlertTriangle };
      case "info": default: return { bg: "bg-[#4FB8E8]/15", border: "border-[#4FB8E8]/40", text: "text-[#4FB8E8]", Icon: Info };
    }
  };

  const formatTime = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="relative space-y-4 pb-24">
      <PageHeader title="Alerts & Recommendations" backHref="/student/home" backLabel="Back to Home" />

      {!ready ? (
        <div className="h-40 animate-pulse rounded-2xl bg-[#0E1C30]" />
      ) : alertHistory.length === 0 ? (
        <div className="rounded-2xl border border-[#294467]/60 bg-[#0E1C30] p-6 text-center text-[#7F93B3] flex flex-col items-center">
          <CheckCircle2 className="h-8 w-8 text-[#3DDC84] mb-2 opacity-50" />
          <p className="text-sm">No alerts right now. Campus conditions look stable.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {alertHistory.map((alert: any) => {
            const { bg, border, text, Icon } = getAlertStyles(alert.severity || "info");

            return (
              <div key={alert.uniqueKey} className={`rounded-xl border ${border} ${bg} p-4 flex flex-col gap-3 shadow-md`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg bg-black/20 ${text}`}><Icon className="h-5 w-5" /></div>
                    <div>
                      <p className={`font-bold text-base ${text}`}>{alert.title}</p>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[11px] font-semibold text-white/70">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {alert.zoneName || "Campus Zone"}</span>
                        <span className="text-white/30">•</span>
                        <span className="text-[#7F93B3]">{formatTime(alert.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  {alert.timeToThreshold && (
                    <div className="flex items-center gap-1 rounded-full bg-[#F2545B] px-2 py-1 text-[10px] font-bold uppercase text-white shadow-sm shrink-0">
                      <Clock className="h-3 w-3" /> {alert.timeToThreshold} min
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium text-[#E2E8F0]">{alert.message}</p>
                  {alert.reason && (
                    <p className="mt-1.5 text-[11px] text-[#7F93B3] flex items-start gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#7F93B3] mt-1 shrink-0" /> {alert.reason}
                    </p>
                  )}
                </div>

                {alert.recommendation && (
                  <div className="mt-0.5 bg-black/30 rounded-lg px-3 py-2 border border-white/10 flex items-center gap-2.5">
                    <ArrowRight className={`h-4 w-4 ${text} shrink-0`} />
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-white/50 mb-0.5">Action Required</p>
                      <p className={`text-xs font-bold ${text}`}>{alert.recommendation}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}