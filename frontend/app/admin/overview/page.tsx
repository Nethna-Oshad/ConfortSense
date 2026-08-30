"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import PageHeader from "@/components/comfort/PageHeader";
import { useComfortData } from "@/lib/comfort-data";
import { Users, Wind, ThermometerSun, AlertOctagon, X, TrendingUp, AlertTriangle } from "lucide-react";

// #NNN: useSearchParams use karana component eka wena ekakata ganna ona Next.js wala Suspense awlak nathi wenna
function OverviewContent() {
  const { adminOverview, ready } = useComfortData();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [query, setQuery] = useState("");
  const [selectedZone, setSelectedZone] = useState<any | null>(null);

  // #NNN: URL eke ?zoneId= kiyala awoth eka auto select wela modal eka open wenawa
  useEffect(() => {
    const zoneIdQuery = searchParams.get("zoneId");
    if (zoneIdQuery && adminOverview?.zones) {
      const z = adminOverview.zones.find(z => z.id === zoneIdQuery);
      if (z) setSelectedZone(z);
    }
  }, [searchParams, adminOverview]);

  const closeModal = () => {
    setSelectedZone(null);
    router.replace("/admin/overview"); // Modal eka wahuwama URL eka clean karanawa
  };

  const filteredZones =
    adminOverview?.zones.filter((zone) =>
      `${zone.name} ${zone.building}`.toLowerCase().includes(query.toLowerCase())
    ).sort((a, b) => a.comfortIndex - b.comfortIndex) ?? [];

  const generateCO2Prediction = (currentCO2: number) => {
    const growthRate = currentCO2 > 700 ? 25 : 10;
    return [
      currentCO2,
      currentCO2 + growthRate * 1,
      currentCO2 + growthRate * 2.5,
      currentCO2 + growthRate * 4,
      currentCO2 + growthRate * 5.2,
      currentCO2 + growthRate * 6.5,
      currentCO2 + growthRate * 8, 
    ];
  };

  return (
    <div className="space-y-6 lg:space-y-8 pb-24 relative">
      <PageHeader
        eyebrow="Admin Overview"
        title="Campus Command Center"
        description="Monitor live environmental metrics, thermal occupancy, and automated alerts across all university zones."
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total Zones" value={adminOverview?.zonesMonitored ?? "--"} subtext="Active sensor nodes" />
        <StatCard label="Campus Health" value={`${adminOverview?.zonesOptimal ?? 0}`} subtext={`Optimal out of ${adminOverview?.zonesMonitored ?? 0}`} accent="text-[#3DDC84]" />
        <StatCard label="Sensors Online" value={adminOverview?.sensorsOnline ?? "--"} subtext={`${adminOverview?.sensorsStale ?? 0} nodes offline`} />
        <StatCard label="Active Alerts" value={adminOverview?.activeAlerts ?? "--"} subtext="Require attention" accent={adminOverview?.activeAlerts && adminOverview.activeAlerts > 0 ? "text-[#F2545B]" : "text-[#7F93B3]"} />
      </div>

      <div className="flex items-center gap-4">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search zones, buildings..."
          className="w-full max-w-2xl rounded-xl border border-[#294467]/70 bg-[#0E1C30] px-5 py-3.5 text-sm font-medium outline-none focus:border-[#4FB8E8] transition-all"
        />
      </div>

      {!ready ? (
        <div className="h-64 animate-pulse rounded-2xl bg-[#0E1C30]" />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredZones.map((zone) => {
            const isCritical = zone.comfortStatus === "critical";
            const isWarning = zone.comfortStatus === "warning";
            const bgClass = isCritical ? "bg-[#F2545B]/10 border-[#F2545B]/40 hover:border-[#F2545B]" 
              : isWarning ? "bg-[#F5A623]/10 border-[#F5A623]/40 hover:border-[#F5A623]" 
              : "bg-[#0E1C30] border-[#294467]/60 hover:border-[#4FB8E8]/50";
            const scoreColor = isCritical ? "text-[#F2545B]" : isWarning ? "text-[#F5A623]" : "text-[#3DDC84]";

            return (
              <button
                key={zone.id}
                onClick={() => setSelectedZone(zone)}
                className={`text-left block w-full rounded-2xl border p-5 transition-all hover:scale-[1.02] shadow-sm ${bgClass}`}
              >
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {isCritical && <AlertOctagon className="h-4 w-4 text-[#F2545B] animate-pulse" />}
                      <p className="font-bold text-white text-lg">{zone.name}</p>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#7F93B3]">
                      {zone.building} • Floor {zone.floor}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`font-mono text-3xl font-bold ${scoreColor}`}>
                      {zone.comfortIndex}
                    </span>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-[#7F93B3]">Score</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2 text-xs">
                    <Wind className={`h-4 w-4 ${zone.readings.co2 > 800 ? "text-[#F5A623]" : "text-[#7F93B3]"}`} />
                    <span className="font-mono text-white">{zone.readings.co2}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <ThermometerSun className={`h-4 w-4 ${zone.readings.temperature > 25 ? "text-[#F5A623]" : "text-[#7F93B3]"}`} />
                    <span className="font-mono text-white">{zone.readings.temperature}°</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs justify-end">
                    <Users className="h-4 w-4 text-[#7F93B3]" />
                    <span className="font-mono text-white">{zone.readings.occupancy}/{zone.capacity}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {selectedZone && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-[#294467]/60 bg-[#0B1220] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-[#294467]/60 p-5 bg-[#0E1C30]">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  {selectedZone.name}
                </h3>
                <p className="text-xs text-[#7F93B3] mt-1">{selectedZone.building} • Floor {selectedZone.floor}</p>
              </div>
              <button onClick={closeModal} className="text-[#7F93B3] hover:text-white transition p-2 bg-white/5 rounded-full">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-6">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#0A0F1C] border border-[#294467]/40 rounded-xl p-3 text-center">
                  <Wind className={`h-5 w-5 mx-auto mb-1 ${selectedZone.readings.co2 > 800 ? "text-[#F5A623]" : "text-[#4FB8E8]"}`} />
                  <p className="font-mono text-lg font-bold text-white">{selectedZone.readings.co2} ppm</p>
                </div>
                <div className="bg-[#0A0F1C] border border-[#294467]/40 rounded-xl p-3 text-center">
                  <ThermometerSun className={`h-5 w-5 mx-auto mb-1 ${selectedZone.readings.temperature > 25 ? "text-[#F5A623]" : "text-[#4FB8E8]"}`} />
                  <p className="font-mono text-lg font-bold text-white">{selectedZone.readings.temperature}°C</p>
                </div>
                <div className="bg-[#0A0F1C] border border-[#294467]/40 rounded-xl p-3 text-center">
                  <Users className="h-5 w-5 mx-auto mb-1 text-[#4FB8E8]" />
                  <p className="font-mono text-lg font-bold text-white">{selectedZone.readings.occupancy}/{selectedZone.capacity}</p>
                </div>
              </div>

              <div className="bg-[#0E1C30] border border-[#F5A623]/20 rounded-xl p-4 relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#F5A623] flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4" /> 30-Min CO2 Projection
                  </p>
                  <span className="text-[10px] font-mono text-[#7F93B3] bg-black/40 px-2 py-1 rounded">Limit: 1000 ppm</span>
                </div>

                <div className="relative h-32 w-full mt-2">
                  {(() => {
                    const forecast = generateCO2Prediction(selectedZone.readings.co2);
                    const minCO2 = 400;
                    const maxCO2 = 1200;
                    const w = 400; 
                    const h = 100; 
                    
                    const points = forecast.map((val, i) => {
                      const x = (i / (forecast.length - 1)) * w;
                      const y = h - ((val - minCO2) / (maxCO2 - minCO2)) * h;
                      return `${x},${y}`;
                    }).join(" ");

                    const limitY = h - ((1000 - minCO2) / (maxCO2 - minCO2)) * h;
                    const willCrossLimit = forecast[forecast.length - 1] > 1000;

                    return (
                      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full overflow-visible">
                        <polygon points={`0,${h} ${points} ${w},${h}`} fill="url(#co2-gradient)" opacity="0.2"/>
                        <polyline points={points} fill="none" stroke={willCrossLimit ? "#F2545B" : "#F5A623"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="0" y1={limitY} x2={w} y2={limitY} stroke="#F2545B" strokeDasharray="4 4" strokeWidth="1.5" opacity="0.6"/>
                        <defs>
                          <linearGradient id="co2-gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={willCrossLimit ? "#F2545B" : "#F5A623"}/>
                            <stop offset="100%" stopColor="transparent"/>
                          </linearGradient>
                        </defs>
                      </svg>
                    );
                  })()}
                </div>

                <div className="flex items-center justify-between mt-2 text-[10px] font-bold text-[#7F93B3] uppercase">
                  <span>Now</span>
                  <span>+15 min</span>
                  <span>+30 min</span>
                </div>

                {generateCO2Prediction(selectedZone.readings.co2)[6] > 1000 && (
                  <div className="mt-4 flex items-center gap-2 bg-[#F2545B]/15 text-[#F2545B] text-xs font-semibold p-2.5 rounded-lg border border-[#F2545B]/30">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    Warning: CO2 will exceed safe limits (1000 ppm) within 30 minutes. Action required.
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button className="bg-gradient-to-r from-[#2B7FE0] to-[#4FB8E8] text-white font-bold text-sm py-3 rounded-xl shadow-lg hover:opacity-90 transition">
                  Adjust HVAC Settings
                </button>
                <button className="bg-[#0A0F1C] border border-[#294467]/60 text-white font-bold text-sm py-3 rounded-xl hover:bg-[#294467]/40 transition">
                  Dispatch Maintenance
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, subtext, accent = "text-white" }: { label: string; value: string | number; subtext: string; accent?: string; }) {
  return (
    <div className="rounded-2xl border border-[#294467]/60 bg-[#0E1C30] p-4 flex flex-col justify-between h-full">
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#7F93B3]">{label}</p>
      <div>
        <p className={`mt-2 font-mono text-3xl font-bold ${accent}`}>{value}</p>
        <p className="text-[10px] uppercase font-semibold text-[#5A6C8A] mt-1 tracking-wide">{subtext}</p>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="h-screen bg-[#05070D]" />}>
      <OverviewContent />
    </Suspense>
  );
}