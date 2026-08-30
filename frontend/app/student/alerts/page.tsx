"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/comfort/PageHeader";
import { useComfortData } from "@/lib/comfort-data";
import { AlertTriangle, AlertOctagon, Info, Clock, CheckCircle2, MapPin, ArrowRight, ShieldCheck, Globe } from "lucide-react";

export default function StudentAlertsPage() {
  const { studentHome, ready } = useComfortData();
  const rawAlerts = studentHome?.studentAlerts ?? [];
  const currentZoneId = studentHome?.nearestZone?.id;

  // #NNN: Aluth Tab State eka - 'current' (Default) saha 'campus' (All Alerts)
  const [viewMode, setViewMode] = useState<"current" | "campus">("current");
  const [simulationStarted, setSimulationStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSimulationStarted(true);
    }, 3000); 
    return () => clearTimeout(timer);
  }, []);

  // #NNN: View Mode eka anuwa Alerts filter karanawa
  const filteredRawAlerts = rawAlerts.filter((alert: any) => {
    if (viewMode === "current") {
      return alert.zoneId === currentZoneId;
    }
    return true; // 'campus' mode eke okkoma pennanawa
  });

  const uniqueAlertsMap = new Map();
  
  if (simulationStarted) {
    filteredRawAlerts.forEach((alert: any) => {
      const signature = `${alert.zoneId}-${alert.title}`.toLowerCase();
      uniqueAlertsMap.set(signature, { ...alert, uniqueKey: signature });
    });
  }

  const activeAlerts = Array.from(uniqueAlertsMap.values());

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
      <PageHeader title="My Environment Alerts" backHref="/student/home" backLabel="Back to Home" />

      {/* #NNN: Current Zone vs All Alerts Tabs (Toggle) */}
      <div className="flex bg-[#0B1220] border border-[#294467]/60 rounded-xl p-1 shadow-sm">
        <button
          onClick={() => setViewMode("current")}
          className={`flex-1 py-2.5 text-[11px] font-bold uppercase tracking-widest rounded-lg transition-all ${
            viewMode === "current" 
              ? "bg-[#294467]/80 text-white shadow-md" 
              : "text-[#7F93B3] hover:text-[#4FB8E8]"
          }`}
        >
          Current Zone
        </button>
        <button
          onClick={() => setViewMode("campus")}
          className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-widest rounded-lg transition-all ${
            viewMode === "campus" 
              ? "bg-[#294467]/80 text-white shadow-md" 
              : "text-[#7F93B3] hover:text-[#4FB8E8]"
          }`}
        >
          <Globe className="h-3.5 w-3.5" /> All Alerts
        </button>
      </div>

      {!ready ? (
        <div className="h-40 animate-pulse rounded-2xl bg-[#0E1C30]" />
      ) : activeAlerts.length === 0 ? (
        <div className="rounded-2xl border border-[#3DDC84]/30 bg-[#3DDC84]/10 p-8 text-center flex flex-col items-center shadow-lg transition-all duration-500">
          <div className="p-3 rounded-full bg-[#3DDC84]/20 text-[#3DDC84] mb-3">
            <ShieldCheck className="h-10 w-10 animate-pulse" />
          </div>
          <p className="text-lg font-bold text-white">
            {viewMode === "current" ? "Your Environment is Optimal" : "Campus is Stable"}
          </p>
          <p className="text-xs text-[#7F93B3] mt-1 max-w-md">
            {viewMode === "current" 
              ? "No active discomfort alerts. CO2 and Noise levels in your current zone are within healthy ranges for studying."
              : "No active alerts across the entire campus right now."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {activeAlerts.map((alert: any) => {
            const { bg, border, text, Icon } = getAlertStyles(alert.severity || "info");
            
            // Student inna zone eken pita (Library, Cafe) alert ekak da kiyala balanawa
            const isPublicArea = alert.zoneId !== currentZoneId;

            let displayRecommendation = alert.recommendation;
            if (alert.title === "Acoustic Disruption") {
              displayRecommendation = "Please lower your voice to maintain a quiet study environment.";
            }

            return (
              <div key={alert.uniqueKey} className={`relative rounded-xl border ${border} ${bg} p-4 flex flex-col gap-3 shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-4`}>
                
                {/* #NNN: All Alerts mode eke, public area alerts walata lassanata highlight badge ekak danawa */}
                {isPublicArea && (
                  <div className="absolute -top-3 -right-2 bg-gradient-to-r from-[#9333EA] to-[#6366F1] text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-lg border border-white/20">
                    Public Area
                  </div>
                )}

                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg bg-black/20 ${text}`}><Icon className="h-5 w-5" /></div>
                    <div>
                      <p className={`font-bold text-base ${text}`}>{alert.title}</p>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[11px] font-semibold text-white/70">
                        <span className={`flex items-center gap-1 ${isPublicArea ? "text-[#A855F7]" : ""}`}>
                          <MapPin className="h-3 w-3" /> {alert.zoneName || "Campus Zone"}
                        </span>
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

                {displayRecommendation && (
                  <div className="mt-0.5 bg-black/30 rounded-lg px-3 py-2 border border-white/10 flex items-center gap-2.5">
                    <ArrowRight className={`h-4 w-4 ${text} shrink-0`} />
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-white/50 mb-0.5">Action Required</p>
                      <p className={`text-xs font-bold ${text}`}>{displayRecommendation}</p>
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