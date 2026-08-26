import { memo } from "react";
import { statusDot } from "@/lib/comfort";

function MetricTile({
  label,
  value,
  sublabel,
  status = "optimal",
}: {
  label: string;
  value: string;
  sublabel: string;
  status?: "optimal" | "warning" | "critical";
}) {
  return (
    <div className="rounded-2xl border border-[#294467]/60 bg-[#0E1C30] p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#7F93B3]">
          {label}
        </p>
        <span className={`h-2 w-2 rounded-full ${statusDot(status)}`} />
      </div>
      <p className="font-mono text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs text-[#5A6C8A]">{sublabel}</p>
    </div>
  );
}

export default memo(MetricTile);
