"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { MapPin, UserCircle2, ChevronDown, History, X, LogOut, Compass } from "lucide-react";
import PageHeader from "@/components/comfort/PageHeader";
import MetricTile from "@/components/comfort/MetricTile";
import ZoneCard from "@/components/comfort/ZoneCard";
import { useComfortData } from "@/lib/comfort-data";

export default function StudentHomePage() {
  const { studentHome, ready } = useComfortData();
  const optimal = studentHome?.optimalZone;
  
  // #NNN: Null kiyanne student thama kohewath settle wela na (Exploring). Default 4B.
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>("lecture-hall-4b");
  const [showZonePicker, setShowZonePicker] = useState(false);

  useEffect(() => {
    const savedZone = localStorage.getItem("studentCurrentZone");
    if (savedZone === "none") {
      setSelectedZoneId(null);
    } else if (savedZone) {
      setSelectedZoneId(savedZone);
    }
  }, []);

  const handleZoneChange = (id: string | null) => {
    setSelectedZoneId(id);
    localStorage.setItem("studentCurrentZone", id || "none");
    setShowZonePicker(false);
  };

  if (!ready) {
    return <div className="h-64 animate-pulse rounded-2xl bg-[#0E1C30]" />;
  }

  const allZones = studentHome?.zones || [];
  const currentZone = selectedZoneId ? allZones.find(z => z.id === selectedZoneId) : null;
  const recentZones = allZones.filter(z => ["lecture-hall-4b", "study-hall-a", "library-north"].includes(z.id));

  return (
    <div className="space-y-6 lg:space-y-8 pb-24">
      <PageHeader
        eyebrow="Student Dashboard"
        title={currentZone ? "Your Environment" : "Find your focus zone"}
        action={<UserCircle2 className="h-8 w-8 text-[#7F93B3]" />}
      />

      <div>
        {/* #NNN: Student thama location ekak select karala NATHNAM (ain unama) witharak meka pennanawa */}
        {!currentZone && optimal && (
          <div className="rounded-[28px] border border-[#294467]/60 bg-gradient-to-br from-[#2B7FE0] to-[#4FB8E8] p-5 shadow-[0_20px_50px_rgba(43,127,224,0.25)] animate-in fade-in zoom-in-95 duration-300">
            <div className="mb-3 flex items-center justify-between">
              <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                <Compass className="h-3 w-3" /> Optimal Focus Zone
              </span>
              <span className="text-xs font-semibold uppercase tracking-widest text-white/80">
                Live Suggestion
              </span>
            </div>
            <p className="text-4xl font-bold md:text-5xl">{optimal.comfortIndex} SCORE</p>
            <p className="mt-2 text-lg font-semibold md:text-xl">{optimal.name}</p>
            <p className="mt-2 max-w-xl text-sm text-white/80 md:text-base">
              Currently the quietest and most comfortable area on campus.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                href="/student/map"
                className="inline-flex items-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 px-4 py-2 text-sm font-semibold transition"
              >
                <MapPin className="h-4 w-4" /> View on Map
              </Link>
              <button
                onClick={() => setShowZonePicker(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0B1220]/40 hover:bg-[#0B1220]/60 border border-white/10 px-4 py-2 text-sm font-semibold transition"
              >
                Set My Location
              </button>
            </div>
          </div>
        )}

        {/* #NNN: Location eka select karala (settle wela) inna wita pennana Main Card eka */}
        {currentZone && (
          <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#7F93B3]">
                My Current Location
              </h2>
              <div className="flex items-center gap-2">
                {/* Ain wenna (Leave) karana button eka */}
                <button 
                  onClick={() => handleZoneChange(null)}
                  className="flex items-center gap-1.5 rounded-lg border border-[#F2545B]/40 bg-[#F2545B]/10 hover:bg-[#F2545B]/20 px-3 py-1.5 text-xs font-bold text-[#F2545B] transition"
                >
                  Leave <LogOut className="h-3 w-3" />
                </button>
                <button 
                  onClick={() => setShowZonePicker(true)}
                  className="flex items-center gap-1.5 rounded-lg bg-[#294467]/40 hover:bg-[#294467]/70 px-3 py-1.5 text-xs font-bold text-[#4FB8E8] transition"
                >
                  Change <ChevronDown className="h-3 w-3" />
                </button>
              </div>
            </div>
            
            <div className="rounded-2xl border border-[#294467]/60 bg-[#0E1C30] p-4 md:p-6 shadow-lg">
              <div className="mb-5 flex items-center justify-between">
                <p className="text-2xl font-bold text-white">{currentZone.name}</p>
                <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#4FB8E8]">
                  Live Status
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <MetricTile label="Noise" value={`${currentZone.readings.noise} dB`} sublabel={currentZone.readings.noiseCategory} status={currentZone.comfortStatus} />
                <MetricTile label="Air Quality" value={`${currentZone.readings.co2} ppm`} sublabel={currentZone.readings.airQuality} status={currentZone.comfortStatus} />
                <MetricTile label="Occupancy" value={`${currentZone.readings.occupancy}/${currentZone.capacity}`} sublabel={currentZone.readings.occupancyLabel} status={currentZone.comfortStatus} />
                <MetricTile label="Temp" value={`${currentZone.readings.temperature}°C`} sublabel={currentZone.readings.temperatureLabel} status={currentZone.comfortStatus} />
              </div>
            </div>
          </section>
        )}
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-widest text-[#7F93B3]">
          Other Study Zones
        </h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {allZones.map((zone) => (
            <ZoneCard key={zone.id} zone={zone} />
          ))}
        </div>
      </section>

      {/* #NNN: Popup Modal eka */}
      {showZonePicker && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-[#294467]/60 bg-[#0B1220] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-[#294467]/60 p-4 bg-[#0E1C30]">
              <h3 className="font-bold text-white flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#4FB8E8]" /> Set Current Location
              </h3>
              <button onClick={() => setShowZonePicker(false)} className="text-[#7F93B3] hover:text-white transition">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-5 max-h-[70vh] overflow-y-auto">
              
              <button
                onClick={() => handleZoneChange(null)}
                className={`flex items-center justify-between w-full text-left px-4 py-3 rounded-xl border transition ${
                  selectedZoneId === null 
                    ? "border-[#4FB8E8] bg-[#4FB8E8]/10 text-white" 
                    : "border-dashed border-[#294467]/60 bg-[#0B1220] hover:border-[#4FB8E8]/50 text-[#7F93B3] hover:text-white"
                }`}
              >
                <span className="font-semibold text-sm flex items-center gap-2">
                  <Compass className="h-4 w-4" /> I'm exploring (Not Settled)
                </span>
                {selectedZoneId === null && <span className="h-2 w-2 rounded-full bg-[#4FB8E8]" />}
              </button>

              <div className="space-y-2 pt-2 border-t border-[#294467]/40">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#7F93B3] flex items-center gap-1.5">
                  <History className="h-3 w-3" /> Recent Locations
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {recentZones.map(zone => (
                    <button
                      key={zone.id}
                      onClick={() => handleZoneChange(zone.id)}
                      className={`flex items-center justify-between w-full text-left px-4 py-3 rounded-xl border transition ${
                        selectedZoneId === zone.id 
                          ? "border-[#4FB8E8] bg-[#4FB8E8]/10 text-white" 
                          : "border-[#294467]/40 bg-[#0E1C30] hover:border-[#4FB8E8]/50 text-[#7F93B3] hover:text-white"
                      }`}
                    >
                      <span className="font-semibold text-sm">{zone.name}</span>
                      {selectedZoneId === zone.id && <span className="h-2 w-2 rounded-full bg-[#4FB8E8]" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#294467]/40">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#7F93B3]">
                  All Campus Zones
                </p>
                <select
                  value={selectedZoneId || ""}
                  onChange={(e) => handleZoneChange(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-[#294467]/70 bg-[#0E1C30] px-4 py-3 text-sm text-white outline-none focus:border-[#4FB8E8] transition cursor-pointer"
                >
                  <option value="" disabled>Select a zone...</option>
                  {allZones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}