"use client";

import { useMemo } from "react";
import PageHeader from "@/components/comfort/PageHeader";
import { useComfortData } from "@/lib/comfort-data";
import { ThermometerSun, Wind, Activity, Users, AlertTriangle, ShieldCheck, Cpu, Wifi, WifiOff } from "lucide-react";

export default function AdminAnalyticsPage() {
  const { adminOverview, ready } = useComfortData();
  const zones = adminOverview?.zones ?? [];

  // Data Calculations & Analytics
  const { 
    lectureHalls, 
    avgCo2, 
    avgTemp, 
    avgNoise, 
    hottestZones, 
    topCo2Zones,
    sensorStats,
    airQualityCounts 
  } = useMemo(() => {
    const lecture = zones.filter((z) => z.type === "lecture" || z.type === "lab");
    
    const co2Sum = lecture.reduce((acc, z) => acc + z.readings.co2, 0);
    const tempSum = lecture.reduce((acc, z) => acc + z.readings.temperature, 0);
    const noiseSum = zones.reduce((acc, z) => acc + z.readings.noise, 0);

    // Sensor online vs stale breakdown
    const online = zones.filter(z => z.readings.sensorStatus === "online").length;
    const stale = zones.filter(z => z.readings.sensorStatus !== "online").length;

    // Air Quality breakdown
    const fresh = zones.filter(z => z.readings.airQuality === "Fresh").length;
    const moderate = zones.filter(z => z.readings.airQuality === "Moderate").length;
    const staleAir = zones.filter(z => z.readings.airQuality === "Stale").length;
    
    return {
      lectureHalls: lecture,
      avgCo2: lecture.length ? Math.round(co2Sum / lecture.length) : 0,
      avgTemp: lecture.length ? Number((tempSum / lecture.length).toFixed(1)) : 0,
      avgNoise: zones.length ? Number((noiseSum / zones.length).toFixed(1)) : 0,
      hottestZones: [...zones].sort((a, b) => b.readings.temperature - a.readings.temperature).slice(0, 3),
      topCo2Zones: [...zones].sort((a, b) => b.readings.co2 - a.readings.co2).slice(0, 3),
      sensorStats: { online, stale, total: zones.length },
      airQualityCounts: { fresh, moderate, stale: staleAir },
    };
  }, [zones]);

  const maxCo2 = 1200;

  return (
    <div className="space-y-6 pb-24">
      <PageHeader title="Campus Analytics & Sensor Health" backHref="/admin/overview" backLabel="Back to Overview" />
      
      {!ready ? (
        <div className="h-96 animate-pulse rounded-2xl bg-[#0E1C30]" />
      ) : (
        <div className="space-y-6">
          
          {/* Top Level Summary Metrics */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-[#F2545B]/30 bg-[#F2545B]/5 p-4 flex items-center gap-3">
              <div className="p-3 rounded-xl bg-[#F2545B]/20 text-[#F2545B]">
                <ThermometerSun className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#7F93B3]">Avg Lecture Temp</p>
                <p className="text-xl font-bold text-white">{avgTemp}°C</p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#F5A623]/30 bg-[#F5A623]/5 p-4 flex items-center gap-3">
              <div className="p-3 rounded-xl bg-[#F5A623]/20 text-[#F5A623]">
                <Wind className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#7F93B3]">Avg Lecture CO2</p>
                <p className="text-xl font-bold text-white">{avgCo2} ppm</p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#4FB8E8]/30 bg-[#4FB8E8]/5 p-4 flex items-center gap-3">
              <div className="p-3 rounded-xl bg-[#4FB8E8]/20 text-[#4FB8E8]">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#7F93B3]">Campus Avg Noise</p>
                <p className="text-xl font-bold text-white">{avgNoise} dB</p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#3DDC84]/30 bg-[#3DDC84]/5 p-4 flex items-center gap-3">
              <div className="p-3 rounded-xl bg-[#3DDC84]/20 text-[#3DDC84]">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#7F93B3]">Active Sensors</p>
                <p className="text-xl font-bold text-white">{sensorStats.online}/{sensorStats.total}</p>
              </div>
            </div>
          </div>

          {/* Sensors & Air Quality Deep-Dive Section */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            
            {/* Sensor Nodes Health Status */}
            <section className="rounded-2xl border border-[#294467]/60 bg-[#0E1C30] p-5 md:p-6">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-[#7F93B3]">
                  IoT Sensor Network Health
                </p>
                <Cpu className="h-4 w-4 text-[#7F93B3]" />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="rounded-xl bg-[#0A0F1C] border border-[#3DDC84]/30 p-4 flex items-center gap-3">
                  <Wifi className="h-6 w-6 text-[#3DDC84]" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#7F93B3]">Online Nodes</p>
                    <p className="text-xl font-bold text-[#3DDC84]">{sensorStats.online}</p>
                  </div>
                </div>

                <div className="rounded-xl bg-[#0A0F1C] border border-[#F2545B]/30 p-4 flex items-center gap-3">
                  <WifiOff className="h-6 w-6 text-[#F2545B]" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#7F93B3]">Stale / Offline</p>
                    <p className="text-xl font-bold text-[#F2545B]">{sensorStats.stale}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[11px] font-semibold text-[#7F93B3] uppercase">Node Status Breakdown</p>
                {zones.map((zone) => {
                  const isOnline = zone.readings.sensorStatus === "online";
                  return (
                    <div key={zone.id} className="flex items-center justify-between text-xs bg-[#05070D] p-2.5 rounded-lg border border-white/5">
                      <span className="text-white font-medium">{zone.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${isOnline ? "bg-[#3DDC84]/15 text-[#3DDC84]" : "bg-[#F2545B]/15 text-[#F2545B]"}`}>
                        {isOnline ? "Operational (Online)" : "Stale Telemetry"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Air Quality Classification Distribution */}
            <section className="rounded-2xl border border-[#294467]/60 bg-[#0E1C30] p-5 md:p-6">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-[#7F93B3]">
                  Campus Air Quality Distribution
                </p>
                <ShieldCheck className="h-4 w-4 text-[#7F93B3]" />
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="rounded-xl bg-[#0A0F1C] border border-[#3DDC84]/30 p-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#3DDC84]">Fresh</p>
                  <p className="text-xl font-bold text-white mt-1">{airQualityCounts.fresh}</p>
                </div>
                <div className="rounded-xl bg-[#0A0F1C] border border-[#F5A623]/30 p-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#F5A623]">Moderate</p>
                  <p className="text-xl font-bold text-white mt-1">{airQualityCounts.moderate}</p>
                </div>
                <div className="rounded-xl bg-[#0A0F1C] border border-[#F2545B]/30 p-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#F2545B]">Stale</p>
                  <p className="text-xl font-bold text-white mt-1">{airQualityCounts.stale}</p>
                </div>
              </div>

              <div className="space-y-3">
                {zones.map((zone) => {
                  const aq = zone.readings.airQuality;
                  const color = aq === "Fresh" ? "text-[#3DDC84]" : aq === "Moderate" ? "text-[#F5A623]" : "text-[#F2545B]";
                  return (
                    <div key={zone.id} className="flex items-center justify-between text-xs bg-[#05070D] p-2.5 rounded-lg border border-white/5">
                      <span className="text-white font-medium">{zone.name}</span>
                      <span className={`font-mono font-bold ${color}`}>{zone.readings.co2} ppm ({aq})</span>
                    </div>
                  );
                })}
              </div>
            </section>

          </div>

          {/* Charts: CO2 Levels & Density */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            
            <section className="rounded-2xl border border-[#294467]/60 bg-[#0E1C30] p-5 md:p-6">
              <div className="mb-6 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-[#7F93B3]">
                  Lecture Hall CO2 Levels
                </p>
                <Wind className="h-4 w-4 text-[#7F93B3]" />
              </div>
              <div className="space-y-4">
                {lectureHalls.map((zone) => {
                  const co2Ratio = Math.min((zone.readings.co2 / maxCo2) * 100, 100);
                  const isHigh = zone.readings.co2 > 800;
                  const barColor = isHigh ? "from-[#F2545B] to-[#F5A623]" : "from-[#3DDC84] to-[#2B7FE0]";
                  
                  return (
                    <div key={zone.id} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#E2E8F0] font-medium">{zone.name}</span>
                        <span className={`font-mono font-bold ${isHigh ? "text-[#F2545B]" : "text-[#4FB8E8]"}`}>
                          {zone.readings.co2} ppm
                        </span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#0A0F1C] border border-white/5">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-500`}
                          style={{ width: `${co2Ratio}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-2xl border border-[#294467]/60 bg-[#0E1C30] p-5 md:p-6">
              <div className="mb-6 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-[#7F93B3]">
                  Campus Density (Occupancy)
                </p>
                <Users className="h-4 w-4 text-[#7F93B3]" />
              </div>
              <div className="space-y-4">
                {[...zones].sort((a, b) => (b.readings.occupancy / b.capacity) - (a.readings.occupancy / a.capacity)).slice(0, 6).map((zone) => {
                  const fillRatio = Math.min((zone.readings.occupancy / zone.capacity) * 100, 100);
                  const isCrowded = fillRatio > 85;
                  const barColor = isCrowded ? "from-[#F5A623] to-[#F2545B]" : "from-[#2B7FE0] to-[#4FB8E8]";

                  return (
                    <div key={zone.id} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#E2E8F0] font-medium">{zone.name}</span>
                        <span className="font-mono text-[#7F93B3]">
                          <span className={isCrowded ? "text-[#F5A623] font-bold" : "text-white"}>{Math.round(fillRatio)}%</span> Full
                        </span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#0A0F1C] border border-white/5">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-500`}
                          style={{ width: `${fillRatio}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* High-Risk Leaderboards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <section className="rounded-2xl border border-[#F2545B]/20 bg-[#F2545B]/5 p-5">
              <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-[#F2545B] flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" /> Thermal Hotspots (Top 3)
              </p>
              <div className="space-y-3">
                {hottestZones.map((zone, index) => (
                  <div key={zone.id} className="flex items-center justify-between bg-[#0A0F1C]/50 p-3 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <span className="text-[#F2545B] font-mono font-bold">#{index + 1}</span>
                      <span className="text-sm font-medium text-white">{zone.name}</span>
                    </div>
                    <span className="font-mono text-lg font-bold text-[#F2545B]">{zone.readings.temperature}°C</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-[#F5A623]/20 bg-[#F5A623]/5 p-5">
              <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-[#F5A623] flex items-center gap-1.5">
                <Wind className="h-3.5 w-3.5" /> Highest CO2 Accumulation
              </p>
              <div className="space-y-3">
                {topCo2Zones.map((zone, index) => (
                  <div key={zone.id} className="flex items-center justify-between bg-[#0A0F1C]/50 p-3 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <span className="text-[#F5A623] font-mono font-bold">#{index + 1}</span>
                      <span className="text-sm font-medium text-white">{zone.name}</span>
                    </div>
                    <span className="font-mono text-lg font-bold text-[#F5A623]">{zone.readings.co2} ppm</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

        </div>
      )}
    </div>
  );
}