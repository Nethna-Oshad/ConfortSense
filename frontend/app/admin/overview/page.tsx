"use client";

import { useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/comfort/PageHeader";
import { useComfortData } from "@/lib/comfort-data";
import { statusBg, statusColor, statusDot } from "@/lib/comfort";

export default function AdminOverviewPage() {
  const { adminOverview, ready } = useComfortData();
  const [query, setQuery] = useState("");

  const filteredZones =
    adminOverview?.zones.filter((zone) =>
      `${zone.name} ${zone.building}`.toLowerCase().includes(query.toLowerCase())
    ) ?? [];

  return (
    <div className="space-y-6 lg:space-y-8">
      <PageHeader
        eyebrow="Admin Overview"
        title="Campus Comfort Status"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Zones Monitored" value={adminOverview?.zonesMonitored ?? "--"} />
        <StatCard
          label="Health"
          value={`${adminOverview?.zonesOptimal ?? 0} / ${(adminOverview?.zonesWarning ?? 0) + (adminOverview?.zonesCritical ?? 0)}`}
          accent="text-[#3DDC84]"
        />
        <StatCard label="Sensors Online" value={adminOverview?.sensorsOnline ?? "--"} />
        <StatCard
          label="Active Alerts"
          value={adminOverview?.activeAlerts ?? "--"}
          accent="text-[#F2545B]"
        />
      </div>

      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search zones, rooms..."
        className="w-full max-w-2xl rounded-xl border border-[#294467]/70 bg-[#0E1C30] px-4 py-3 text-sm outline-none focus:border-[#4FB8E8]"
      />

      {!ready ? (
        <div className="h-64 animate-pulse rounded-2xl bg-[#0E1C30]" />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredZones.map((zone) => (
            <Link
              key={zone.id}
              href={`/student/zone/${zone.id}`}
              className={`block rounded-2xl border p-4 transition hover:scale-[1.01] ${statusBg(zone.comfortStatus)}`}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${statusDot(zone.comfortStatus)}`} />
                  <p className="font-semibold text-white">{zone.name}</p>
                </div>
                <span className={`font-mono font-bold ${statusColor(zone.comfortStatus)}`}>
                  {zone.comfortIndex}%
                </span>
              </div>
              <p className="text-xs text-[#7F93B3]">
                {zone.alert?.title || zone.comfortLabel} · {zone.building}
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#0B1220]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#2B7FE0] to-[#4FB8E8]"
                  style={{ width: `${zone.comfortIndex}%` }}
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  accent = "text-white",
}: {
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-[#294467]/60 bg-[#0E1C30] p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#7F93B3]">
        {label}
      </p>
      <p className={`mt-2 font-mono text-2xl font-bold md:text-3xl ${accent}`}>{value}</p>
    </div>
  );
}
