"use client";

import PageHeader from "@/components/comfort/PageHeader";
import ComfortGauge from "@/components/comfort/ComfortGauge";
import MetricTile from "@/components/comfort/MetricTile";
import ThermalCamera from "@/components/comfort/ThermalCamera";
import { useComfortData } from "@/lib/comfort-data";
import type { LecturerMode } from "@/lib/types";
import { canViewThermal } from "@/lib/thermal-access";

const MODES: LecturerMode[] = ["lecture", "exam", "group"];

export default function LecturerDashboardPage() {
  const { lecturerDashboard, lecturerMode, setLecturerMode, ready } = useComfortData();
  const zone = lecturerDashboard?.zone;
  const trend = lecturerDashboard?.trend ?? [];
  const alert = lecturerDashboard?.alerts[0] ?? null;
  const maxIndex = Math.max(...trend.map((point) => point.comfortIndex), 1);

  return (
    <div className="space-y-6 lg:space-y-8">
      <PageHeader
        eyebrow="Live Monitoring"
        title={zone?.name || "Lecture Hall 4B"}
      />

      <div className="flex flex-wrap gap-2">
        {MODES.map((item) => (
          <button
            key={item}
            onClick={() => setLecturerMode(item)}
            className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest transition ${
              lecturerMode === item
                ? "bg-gradient-to-r from-[#2B7FE0] to-[#4FB8E8] text-white"
                : "border border-[#294467]/70 text-[#7F93B3] hover:text-white"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {alert && (
        <div className="rounded-2xl border border-[#F5A623]/30 bg-[#F5A623]/10 p-4 text-sm text-[#F5A623]">
          <p className="font-semibold">{alert.title}</p>
          <p className="mt-1">{alert.message}</p>
        </div>
      )}

      {!ready || !zone ? (
        <div className="h-72 animate-pulse rounded-2xl bg-[#0E1C30]" />
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="rounded-2xl border border-[#294467]/60 bg-[#0E1C30] p-6 xl:col-span-4">
            <ComfortGauge score={zone.comfortIndex} label={zone.comfortLabel} />
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-2 xl:col-span-8 xl:grid-cols-4">
            <MetricTile label="CO2" value={`${zone.readings.co2} ppm`} sublabel="Air Quality" status={zone.comfortStatus} />
            <MetricTile label="Temp" value={`${zone.readings.temperature}°C`} sublabel={zone.readings.temperatureLabel} status={zone.comfortStatus} />
            <MetricTile label="Ambient Noise" value={`${zone.readings.noise} dB`} sublabel={zone.readings.noiseCategory} status={zone.comfortStatus} />
            <MetricTile label="Occupancy" value={`${zone.readings.occupancy} people`} sublabel={`${Math.round(zone.readings.settledRatio * 100)}% settled`} status={zone.comfortStatus} />
          </div>

          {canViewThermal("lecturer", zone.type) && zone.readings.thermal && (
            <div className="xl:col-span-12">
              <ThermalCamera
                thermal={zone.readings.thermal}
                zoneName={zone.name}
                capacity={zone.capacity}
                zoneType={zone.type}
                studentOnly
                noiseLevel={zone.readings.noise}
              />
            </div>
          )}

          <section className="rounded-2xl border border-[#294467]/60 bg-[#0E1C30] p-5 md:p-6 xl:col-span-12">
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-[#7F93B3]">
              Trend (2 hrs)
            </p>
            <div className="flex h-32 items-end gap-1 md:h-40">
              {trend.map((point) => (
                <div
                  key={point.timestamp}
                  className="flex-1 rounded-t-md bg-gradient-to-t from-[#2B7FE0] to-[#4FB8E8]"
                  style={{ height: `${(point.comfortIndex / maxIndex) * 100}%` }}
                />
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
