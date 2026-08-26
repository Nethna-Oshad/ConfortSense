"use client";

import { useMemo, useState } from "react";
import PageHeader from "@/components/comfort/PageHeader";
import ThermalCamera from "@/components/comfort/ThermalCamera";
import { useComfortData } from "@/lib/comfort-data";
import { canViewThermal } from "@/lib/thermal-access";

export default function StudentThermalPage() {
  const { zones, ready } = useComfortData();
  const studyZones = useMemo(
    () => zones.filter((zone) => canViewThermal("student", zone.type)),
    [zones]
  );
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const zone =
    studyZones.find((item) => item.id === (selectedId ?? studyZones[0]?.id)) ?? studyZones[0];

  return (
    <div className="space-y-6 lg:space-y-8">
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
          <div className="flex flex-wrap gap-2">
            {studyZones.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest transition ${
                  zone.id === item.id
                    ? "bg-gradient-to-r from-[#2B7FE0] to-[#4FB8E8] text-white"
                    : "border border-[#294467]/70 text-[#7F93B3] hover:text-white"
                }`}
              >
                {item.name}
              </button>
            ))}
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
