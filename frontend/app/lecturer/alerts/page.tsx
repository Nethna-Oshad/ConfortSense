"use client";

import { useState } from "react";
import PageHeader from "@/components/comfort/PageHeader";
import { useComfortData } from "@/lib/comfort-data";
import { AlertTriangle, AlertOctagon, Info, Clock, CheckCircle2, MapPin, ArrowRight, Check, TrendingUp } from "lucide-react";

export default function LecturerAlertsPage() {
  const { lecturerDashboard, ready } = useComfortData();
  const rawAlerts = (lecturerDashboard?.alerts ?? []).filter(Boolean);
  const trendData = lecturerDashboard?.trend ?? [];

  const [dismissedKeys, setDismissedKeys] = useState<Set<string>>(new Set());

  const visibleAlerts = rawAlerts
    .map((alert: any) => {
      const uniqueSignature = `${alert.zoneId}-${alert.title}`.toLowerCase();
      return { ...alert, uniqueKey: uniqueSignature };
    })
    .filter((alert: any) => !dismissedKeys.has(alert.uniqueKey));

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

  const handleMarkAsRead = (key: string, e: React.MouseEvent) => {
    e.stopPropagation(); 
    setDismissedKeys((prev) => new Set(prev).add(key));
  };

  return (
    <div className="relative space-y-4 pb-24">
      <PageHeader title="Actionable Insights & Alerts" backHref="/lecturer/dashboard" backLabel="Back to Dashboard" />

      {!ready ? (
        <div className="h-40 animate-pulse rounded-2xl bg-[#0E1C30]" />
      ) : visibleAlerts.length === 0 ? (
        <div className="rounded-2xl border border-[#294467]/60 bg-[#0E1C30] p-6 text-center text-[#7F93B3] flex flex-col items-center">
          <CheckCircle2 className="h-8 w-8 text-[#3DDC84] mb-2 opacity-50" />
          <p className="text-sm">No active alerts. The learning environment is optimal.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {visibleAlerts.map((alert: any) => {
            const { bg, border, text, Icon } = getAlertStyles(alert.severity || "info");
            const isPredictiveCo2 = alert.title?.toLowerCase().includes("predictive air quality");
            
            // #NNN: Trend data nathnam fallback data ekak generate karagannawa chart eka pennanna
            const chartPoints = trendData.length > 0 
              ? trendData.slice(-10).map((p: any) => p.co2) 
              : [720, 740, 755, 770, 785, alert.timeToThreshold ? 1000 : 800]; // Target 1000ppm projection

            const maxCo2 = 1200;

            return (
              <div key={alert.uniqueKey} className={`rounded-xl border ${border} ${bg} p-4 flex flex-col gap-3 shadow-md`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg bg-black/20 ${text}`}><Icon className="h-5 w-5" /></div>
                    <div>
                      <p className={`font-bold text-base ${text}`}>{alert.title}</p>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[11px] font-semibold text-white/70">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {alert.zoneName || "Assigned Room"}</span>
                        <span className="text-white/30">•</span>
                        <span className="text-[#7F93B3]">{formatTime(alert.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {alert.timeToThreshold && (
                      <div className="flex items-center gap-1 rounded-full bg-[#F2545B] px-2 py-1 text-[10px] font-bold uppercase text-white shadow-sm shrink-0">
                        <Clock className="h-3 w-3" /> {alert.timeToThreshold} min
                      </div>
                    )}
                    <button 
                      onClick={(e) => handleMarkAsRead(alert.uniqueKey, e)}
                      className="flex items-center gap-1 bg-black/20 hover:bg-black/40 border border-white/10 px-2.5 py-1.5 rounded-lg transition text-xs font-medium text-[#7F93B3] hover:text-white"
                    >
                      <Check className="h-3.5 w-3.5" /> Mark read
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-[#E2E8F0]">{alert.message}</p>
                  {alert.reason && (
                    <p className="mt-1.5 text-[11px] text-[#7F93B3] flex items-start gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#7F93B3] mt-1 shrink-0" /> {alert.reason}
                    </p>
                  )}
                </div>

                {/* #NNN: Predictive Target Projection Chart */}
                {isPredictiveCo2 && (
                  <div className="bg-black/40 rounded-xl p-3 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-[#7F93B3]">
                      <span className="flex items-center gap-1 text-[#F5A623]">
                        <TrendingUp className="h-3.5 w-3.5" /> Target Threshold in {alert.timeToThreshold || 15} mins (1000 ppm)
                      </span>
                      <span>Live Projection</span>
                    </div>

                    {/* Bars showing growth towards threshold */}
                    <div className="flex h-20 items-end gap-1.5 pt-3 px-1">
                      {chartPoints.map((val: number, i: number) => {
                        const heightPercent = Math.min((val / maxCo2) * 100, 100);
                        const isTargetZone = val >= 950;
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                            <div 
                              className={`w-full rounded-t transition-all ${isTargetZone ? "bg-gradient-to-t from-[#F2545B] to-[#F5A623] animate-pulse" : "bg-gradient-to-t from-[#2B7FE0] to-[#4FB8E8]"}`}
                              style={{ height: `${heightPercent}%` }}
                            />
                            {/* Tooltip */}
                            <div className="absolute -top-7 hidden group-hover:flex bg-black/90 text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap z-10">
                              {val} ppm
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between text-[9px] text-[#7F93B3] pt-1 border-t border-white/5 font-mono">
                      <span>Current Level</span>
                      <span className="text-[#F2545B] font-bold">Target (1000ppm) in {alert.timeToThreshold || 15}m</span>
                    </div>
                  </div>
                )}

                {alert.recommendation && (
                  <div className="mt-0.5 bg-black/30 rounded-lg px-3 py-2 border border-white/10 flex items-center gap-2.5">
                    <ArrowRight className={`h-4 w-4 ${text} shrink-0`} />
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-white/50 mb-0.5">System Recommendation</p>
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