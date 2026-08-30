"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/comfort/PageHeader";
import ThermalCamera from "@/components/comfort/ThermalCamera";
import { useComfortData } from "@/lib/comfort-data";
import { MapPin } from "lucide-react";

export default function StudentThermalPage() {
  const { zones, ready } = useComfortData();
  const [selectedId, setSelectedId] = useState<string>("lecture-hall-4b");

  // #NNN: Home page eke select karapu eka gannawa, nathnam default "Lecture Hall 4B" walata lock karanawa
  useEffect(() => {
    const savedZone = localStorage.getItem("studentCurrentZone");
    if (savedZone && savedZone !== "none") {
      setSelectedId(savedZone);
    } else {
      setSelectedId("lecture-hall-4b");
    }
  }, []);

  const zone = zones.find((item) => item.id === selectedId) || zones.find((item) => item.id === "lecture-hall-4b");

  return (
    <div className="space-y-6 lg:space-y-8 pb-24">
      <PageHeader
        eyebrow="Student spaces"
        title="Student presence & noise heatmap"
        description="Thermal grid shows only student body heat (36.1–37.2°C). Electronic devices like chargers, laptops, and PCs are filtered out. Noise sensor data is overlaid to show where sound is concentrated, making headcount and crowd density more accurate."
        backHref="/student/home"
        backLabel="Back to Home"
      />

      {!ready ? (
        <div className="h-96 animate-pulse rounded-2xl bg-[#0E1C30]" />
      ) : !zone?.readings.thermal ? (
        <p className="text-sm text-[#7F93B3]">No study-area thermal feeds are online.</p>
      ) : (
        <>
          {/* #NNN: Wena zones select karanna thibba Dropdown eka ain kala. Dan penne current zone eka witharai */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#294467]/60 bg-[#0E1C30] p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#4FB8E8]/10 text-[#4FB8E8]">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#7F93B3]">Viewing Thermal Map For</p>
                <p className="text-lg font-bold text-white">{zone.name}</p>
              </div>
            </div>
          </div>

          <ThermalCamera
            thermal={zone.readings.thermal}
            zoneName={zone.name}
            capacity={zone.capacity}
            zoneType={zone.type}
            studentOnly
            noiseLevel={zone.readings.noise}
          />
        </>
      )}
    </div>
  );
}