"use client";

import { useMemo, useState } from "react";
import PageHeader from "@/components/comfort/PageHeader";
import ThermalCamera from "@/components/comfort/ThermalCamera";
import { useComfortData } from "@/lib/comfort-data";
import { canViewThermal } from "@/lib/thermal-access";

export default function LecturerThermalPage() {
  const { zones, lecturerDashboard, ready } = useComfortData();
  const teachingZones = useMemo(
    () => zones.filter((zone) => canViewThermal("lecturer", zone.type)),
    [zones]
  );
  const defaultId =
    lecturerDashboard?.zone?.id &&
    teachingZones.some((zone) => zone.id === lecturerDashboard.zone.id)
      ? lecturerDashboard.zone.id
      : teachingZones[0]?.id;
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const activeId = selectedId ?? defaultId;
  const zone = teachingZones.find((item) => item.id === activeId) ?? teachingZones[0];

  return (
    <div className="space-y-6 lg:space-y-8">
      <PageHeader
        eyebrow="Teaching spaces"
        title="Lecture & lab heatmaps"
        description="Seating-grid IR views for lecture halls and labs only. Study spaces are hidden from this lecturer view."
        backHref="/lecturer/dashboard"
        backLabel="Back to Dashboard"
      />

      {!ready ? (
        <div className="h-96 animate-pulse rounded-2xl bg-[#0E1C30]" />
      ) : teachingZones.length === 0 || !zone?.readings.thermal ? (
        <p className="text-sm text-[#7F93B3]">No lecture hall or lab thermal feeds are online.</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {teachingZones.map((item) => (
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
