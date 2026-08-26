"use client";

import Link from "next/link";
import { MapPin, UserCircle2 } from "lucide-react";
import PageHeader from "@/components/comfort/PageHeader";
import MetricTile from "@/components/comfort/MetricTile";
import ZoneCard from "@/components/comfort/ZoneCard";
import { useComfortData } from "@/lib/comfort-data";

export default function StudentHomePage() {
  const { studentHome, ready } = useComfortData();
  const optimal = studentHome?.optimalZone;
  const nearest = studentHome?.nearestZone;

  if (!ready) {
    return <div className="h-64 animate-pulse rounded-2xl bg-[#0E1C30]" />;
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      <PageHeader
        eyebrow="Student Dashboard"
        title="Find your focus zone"
        action={<UserCircle2 className="h-8 w-8 text-[#7F93B3]" />}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {optimal && (
          <div className="rounded-[28px] border border-[#294467]/60 bg-gradient-to-br from-[#2B7FE0] to-[#4FB8E8] p-5 shadow-[0_20px_50px_rgba(43,127,224,0.25)] xl:col-span-7">
            <div className="mb-3 flex items-center justify-between">
              <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                Optimal Focus Zone
              </span>
              <span className="text-xs font-semibold uppercase tracking-widest text-white/80">
                Live Status
              </span>
            </div>
            <p className="text-4xl font-bold md:text-5xl">{optimal.comfortIndex} SCORE</p>
            <p className="mt-2 text-lg font-semibold md:text-xl">{optimal.name}</p>
            <p className="mt-2 max-w-xl text-sm text-white/80 md:text-base">
              Currently the quietest and most comfortable area on campus.
            </p>
            <Link
              href="/student/map"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold transition hover:bg-white/25"
            >
              <MapPin className="h-4 w-4" />
              View on Map
            </Link>
          </div>
        )}

        {nearest && (
          <section className="space-y-4 xl:col-span-5">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#7F93B3]">
              Nearest Location
            </h2>
            <div className="rounded-2xl border border-[#294467]/60 bg-[#0E1C30] p-4 md:p-5">
              <p className="mb-4 text-lg font-semibold">{nearest.name}</p>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-2">
                <MetricTile
                  label="Noise"
                  value={`${nearest.readings.noise} dB`}
                  sublabel={nearest.readings.noiseCategory}
                  status={nearest.comfortStatus}
                />
                <MetricTile
                  label="Air Quality"
                  value={`${nearest.readings.co2} ppm`}
                  sublabel={nearest.readings.airQuality}
                  status={nearest.comfortStatus}
                />
                <MetricTile
                  label="Occupancy"
                  value={`${nearest.readings.occupancy}/${nearest.capacity}`}
                  sublabel={nearest.readings.occupancyLabel}
                  status={nearest.comfortStatus}
                />
                <MetricTile
                  label="Temp"
                  value={`${nearest.readings.temperature}°C`}
                  sublabel={nearest.readings.temperatureLabel}
                  status={nearest.comfortStatus}
                />
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
          {studentHome?.zones.map((zone) => (
            <ZoneCard key={zone.id} zone={zone} />
          ))}
        </div>
      </section>
    </div>
  );
}
