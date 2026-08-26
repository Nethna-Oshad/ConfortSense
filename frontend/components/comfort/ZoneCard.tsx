import { memo } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Zone } from "@/lib/types";
import { statusColor, statusDot } from "@/lib/comfort";

function ZoneCard({ zone }: { zone: Zone }) {
  return (
    <Link
      href={`/student/zone/${zone.id}`}
      prefetch
      className="flex items-center justify-between rounded-2xl border border-[#294467]/60 bg-gradient-to-b from-[#0E1C30] to-[#16294A]/70 p-4 transition hover:border-[#4FB8E8]/40"
    >
      <div className="flex items-center gap-3">
        <span className={`h-2.5 w-2.5 rounded-full ${statusDot(zone.comfortStatus)}`} />
        <div>
          <p className="font-semibold text-white">{zone.name}</p>
          <p className="text-xs text-[#7F93B3]">
            {zone.readings.noiseCategory} · {zone.readings.airQuality} air
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`font-mono text-lg font-bold ${statusColor(zone.comfortStatus)}`}>
          {zone.comfortIndex}
        </span>
        <ChevronRight className="h-4 w-4 text-[#5A6C8A]" />
      </div>
    </Link>
  );
}

export default memo(ZoneCard);
