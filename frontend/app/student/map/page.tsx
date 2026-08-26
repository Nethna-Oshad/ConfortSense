"use client";

import Link from "next/link";
import PageHeader from "@/components/comfort/PageHeader";
import { useComfortData } from "@/lib/comfort-data";
import { statusBg, statusColor } from "@/lib/comfort";
import { Users, VolumeX, Volume2, Volume1, Map } from "lucide-react"; // #NNN: Aluth icons import kala

export default function StudentMapPage() {
  const { zones, ready } = useComfortData();

  // #NNN: Zones tika nikanma pennanne nathuwa 'Building' eka anuwa group karanawa (Spatial layout ekak widiyata)
  const buildings = Array.from(new Set(zones.map((z) => z.building)));

  // #NNN: Noise level eka anuwa icon eka wenas karana function ekak
  const getNoiseIcon = (category: string) => {
    if (category === "Quiet") return <VolumeX className="h-4 w-4 text-[#3DDC84]" />;
    if (category === "Moderate") return <Volume1 className="h-4 w-4 text-[#F5A623]" />;
    return <Volume2 className="h-4 w-4 text-[#F2545B]" />;
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      <PageHeader
        title="Live Spatial Heatmap"
        description="Select a building area to find distraction-free study zones."
        backHref="/student/home"
        backLabel="Back to Home"
      />
      
      {!ready ? (
        <div className="h-72 animate-pulse rounded-2xl bg-[#0E1C30]" />
      ) : (
        <div className="space-y-8">
          {/* #NNN: Building eken building ekata loop wenawa */}
          {buildings.map((building) => {
            const buildingZones = zones.filter((z) => z.building === building);

            return (
              <section key={building} className="rounded-[28px] border border-[#294467]/40 bg-[#0B1220] p-5 md:p-7">
                <div className="mb-5 flex items-center gap-3 border-b border-[#294467]/40 pb-3">
                  <div className="rounded-lg bg-gradient-to-br from-[#2B7FE0] to-[#4FB8E8] p-2 text-white">
                    <Map className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-bold text-white uppercase tracking-wide">{building}</h2>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {buildingZones.map((zone) => (
                    <Link
                      key={zone.id}
                      href={`/student/zone/${zone.id}`}
                      className={`relative flex flex-col justify-between overflow-hidden rounded-2xl border p-5 transition-all hover:scale-[1.02] hover:shadow-lg ${statusBg(zone.comfortStatus)}`}
                    >
                      {/* #NNN: Comfort Score eka ha Zone Name eka */}
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-widest text-[#7F93B3] mb-1">
                            {zone.type === "study" ? "Study Area" : zone.type === "library" ? "Library Zone" : "Lecture Hall"}
                          </p>
                          <p className="text-base font-semibold text-white">{zone.name}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-mono text-2xl font-bold ${statusColor(zone.comfortStatus)}`}>
                            {zone.comfortIndex}
                          </p>
                        </div>
                      </div>

                      {/* #NNN: Distraction-free metrics (Noise ha Occupancy) pennana kotasa */}
                      <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-[#0A0F1C]/50 p-3 border border-white/5">
                        <div className="flex items-center gap-2">
                          {getNoiseIcon(zone.readings.noiseCategory)}
                          <div>
                            <p className="text-[10px] text-[#7F93B3] uppercase font-semibold">Acoustics</p>
                            <p className="text-xs text-white font-medium">{zone.readings.noiseCategory}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 border-l border-white/10 pl-3">
                          <Users className="h-4 w-4 text-[#4FB8E8]" />
                          <div>
                            <p className="text-[10px] text-[#7F93B3] uppercase font-semibold">Crowd</p>
                            <p className="text-xs text-white font-medium">{zone.readings.occupancyLabel}</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}