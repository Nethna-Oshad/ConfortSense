"use client";

import PageHeader from "@/components/comfort/PageHeader";
import ZoneCard from "@/components/comfort/ZoneCard";
import { useComfortData } from "@/lib/comfort-data";

export default function StudentZonesPage() {
  const { zones, ready } = useComfortData();

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Zones"
        description="Live comfort rankings across campus study spaces."
        backHref="/student/home"
        backLabel="Back to Home"
      />
      {!ready ? (
        <div className="h-48 animate-pulse rounded-2xl bg-[#0E1C30]" />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {zones.map((zone) => (
            <ZoneCard key={zone.id} zone={zone} />
          ))}
        </div>
      )}
    </div>
  );
}
