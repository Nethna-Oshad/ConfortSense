"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PageHeader from "@/components/comfort/PageHeader";
import ComfortGauge from "@/components/comfort/ComfortGauge";
import MetricTile from "@/components/comfort/MetricTile";
import ThermalCamera from "@/components/comfort/ThermalCamera";
import { useComfortData } from "@/lib/comfort-data";
import type { TrendPoint, Zone } from "@/lib/types";
import { canViewThermal } from "@/lib/thermal-access";

export default function ZoneDetailPage() {
  const params = useParams<{ id: string }>();
  const { getZoneById, getZoneTrendCached, ready } = useComfortData();
  const [zone, setZone] = useState<Zone | null>(null);
  const [trend, setTrend] = useState<TrendPoint[]>([]);

  useEffect(() => {
    const cached = getZoneById(params.id);
    if (cached) setZone(cached);

    getZoneTrendCached(params.id).then(setTrend);
  }, [params.id, getZoneById, getZoneTrendCached, ready]);

  useEffect(() => {
    const cached = getZoneById(params.id);
    if (cached) setZone(cached);
  }, [params.id, getZoneById, ready]);

  if (!zone) {
    return <div className="h-64 animate-pulse rounded-2xl bg-[#0E1C30]" />;
  }

  const maxIndex = Math.max(...trend.map((point) => point.comfortIndex), 1);

  return (
    <div className="space-y-6 lg:space-y-8">
      <PageHeader
        eyebrow="Zone Detail"
        title={zone.name}
        description={`${zone.building} · Floor ${zone.floor}`}
        backHref="/student/zones"
        backLabel="Back to My Zones"
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="rounded-2xl border border-[#294467]/60 bg-[#0E1C30] p-6 xl:col-span-4">
          <ComfortGauge score={zone.comfortIndex} label={zone.comfortLabel} />
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:col-span-8">
          <MetricTile label="CO2" value={`${zone.readings.co2} ppm`} sublabel={zone.readings.airQuality} status={zone.comfortStatus} />
          <MetricTile label="Noise" value={`${zone.readings.noise} dB`} sublabel={zone.readings.noiseCategory} status={zone.comfortStatus} />
          <MetricTile label="Occupancy" value={`${zone.readings.occupancy}/${zone.capacity}`} sublabel={zone.readings.occupancyLabel} status={zone.comfortStatus} />
          <MetricTile label="Temp" value={`${zone.readings.temperature}°C`} sublabel={zone.readings.temperatureLabel} status={zone.comfortStatus} />
        </div>
      </div>

      {canViewThermal("student", zone.type) && zone.readings.thermal && (
        <ThermalCamera
          thermal={zone.readings.thermal}
          zoneName={zone.name}
          capacity={zone.capacity}
          zoneType={zone.type}
          studentOnly
          noiseLevel={zone.readings.noise}
        />
      )}

      <section className="rounded-2xl border border-[#294467]/60 bg-[#0E1C30] p-5 md:p-6">
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

      <button className="w-full max-w-sm rounded-2xl bg-gradient-to-r from-[#2B7FE0] to-[#4FB8E8] py-4 text-sm font-bold uppercase tracking-wide">
        Get Directions
      </button>
    </div>
  );
}
