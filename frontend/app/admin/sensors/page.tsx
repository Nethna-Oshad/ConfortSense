"use client";

import PageHeader from "@/components/comfort/PageHeader";
import { useComfortData } from "@/lib/comfort-data";
import { formatTime } from "@/lib/comfort";

export default function AdminSensorsPage() {
  const { sensors, ready } = useComfortData();

  return (
    <div className="space-y-4">
      <PageHeader title="Sensor Management" backHref="/admin/overview" backLabel="Back to Overview" />
      {!ready ? (
        <div className="h-48 animate-pulse rounded-2xl bg-[#0E1C30]" />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {sensors.map((sensor) => (
            <div
              key={sensor.id}
              className="rounded-2xl border border-[#294467]/60 bg-[#0E1C30] p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{sensor.zoneName}</p>
                  <p className="text-xs text-[#7F93B3]">
                    Last updated {formatTime(sensor.lastUpdated)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                    sensor.status === "online"
                      ? "bg-[#3DDC84]/10 text-[#3DDC84]"
                      : "bg-[#F5A623]/10 text-[#F5A623]"
                  }`}
                >
                  {sensor.status}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-[#7F93B3]">
                <p>Battery: {sensor.battery}%</p>
                <p>Signal: {sensor.signal}%</p>
              </div>
              <button className="mt-4 w-full rounded-xl border border-[#294467]/70 py-2 text-xs font-bold uppercase tracking-widest text-[#4FB8E8]">
                Recalibrate Baseline
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
