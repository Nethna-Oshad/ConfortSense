"use client";

import { memo, useCallback, useEffect, useState } from "react";
import {
  Activity,
  Droplets,
  PlusCircle,
  Server,
  Thermometer,
  Volume2,
  Wind,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { getTelemetry, postTelemetry } from "@/lib/api";
import type { TelemetryRecord } from "@/lib/types";
import PageHeader from "@/components/comfort/PageHeader";

function TelemetryConsole() {
  const [data, setData] = useState<TelemetryRecord[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    co2_level: "",
    noise_level: "",
    temperature: "",
    humidity: "",
  });

  const fetchData = useCallback(async () => {
    try {
      const records = await getTelemetry();
      setData(records);
    } catch (error) {
      console.error("Error fetching telemetry:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleManualSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await postTelemetry({ ...formData, entry_type: "manual" });
      setFormData({ co2_level: "", noise_level: "", temperature: "", humidity: "" });
      await fetchData();
    } catch (error) {
      console.error("Error saving manual entry:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const latest = data[0] ?? null;
  const pathname = usePathname();
  const backTarget = pathname.startsWith("/lecturer")
    ? { href: "/lecturer/dashboard", label: "Back to Dashboard" }
    : pathname.startsWith("/admin")
      ? { href: "/admin/overview", label: "Back to Overview" }
      : { href: "/student/home", label: "Back to Home" };

  return (
    <div className="space-y-6 lg:space-y-8">
      <PageHeader
        eyebrow="Legacy Sensor Console"
        title="Study-Comfort Control Center"
        description="View automatic mock sensor streams and manually inject telemetry readings for demo and testing."
        backHref={backTarget.href}
        backLabel={backTarget.label}
        action={
          <div className="flex items-center gap-2 text-sm text-[#7F93B3]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            Active & Syncing
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="CO2 Concentration"
          value={latest?.co2_level ?? "--"}
          unit="PPM"
          icon={<Wind className="h-5 w-5 text-emerald-400" />}
          borderColor="border-emerald-500/20"
        />
        <MetricCard
          title="Acoustic Disruption"
          value={latest?.noise_level ?? "--"}
          unit="dB"
          icon={<Volume2 className="h-5 w-5 text-amber-400" />}
          borderColor="border-amber-500/20"
        />
        <MetricCard
          title="Thermal Mass"
          value={latest?.temperature ?? "--"}
          unit="°C"
          icon={<Thermometer className="h-5 w-5 text-rose-400" />}
          borderColor="border-rose-500/20"
        />
        <MetricCard
          title="Air Stagnation"
          value={latest?.humidity ?? "--"}
          unit="%"
          icon={<Droplets className="h-5 w-5 text-cyan-400" />}
          borderColor="border-cyan-500/20"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <section className="rounded-2xl border border-[#294467]/60 bg-[#0F1523] p-5 shadow-2xl xl:col-span-4">
          <h2 className="mb-6 flex items-center gap-2 border-b border-[#294467]/60 pb-3 text-sm font-bold uppercase tracking-widest text-[#7F93B3]">
            <PlusCircle className="h-4 w-4 text-[#4FB8E8]" />
            Data Injection
          </h2>
          <form onSubmit={handleManualSubmit} className="space-y-4">
            {Object.keys(formData).map((key) => (
              <div key={key}>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-[#5A6C8A]">
                  {key.replace("_", " ")}
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData[key as keyof typeof formData]}
                  onChange={(event) =>
                    setFormData({ ...formData, [key]: event.target.value })
                  }
                  className="w-full rounded-xl border border-[#294467]/70 bg-[#070B14] px-3 py-2.5 font-mono text-sm text-slate-200 outline-none focus:border-[#4FB8E8]"
                  placeholder="0.0"
                />
              </div>
            ))}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2B7FE0] to-[#4FB8E8] py-3 text-sm font-bold uppercase tracking-wide disabled:opacity-50"
            >
              {isSubmitting ? (
                <Activity className="h-4 w-4 animate-spin" />
              ) : (
                "Execute Override"
              )}
            </button>
          </form>
        </section>

        <section className="overflow-hidden rounded-2xl border border-[#294467]/60 bg-[#0F1523] shadow-2xl xl:col-span-8">
          <div className="flex items-center justify-between border-b border-[#294467]/60 p-5">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#7F93B3]">
              Telemetry Event Log
            </h2>
            <span className="rounded-md border border-[#294467]/70 bg-[#0B1220] px-2.5 py-1 text-xs text-[#7F93B3]">
              Total Records: <span className="text-white">{data.length}</span>
            </span>
          </div>

          <div className="admin-scroll max-h-[420px] overflow-auto bg-[#070B14]/50 lg:max-h-[520px]">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead className="sticky top-0 z-10 border-b border-[#294467]/60 bg-[#0F1523]">
                <tr className="text-xs font-bold uppercase tracking-wider text-[#5A6C8A]">
                  <th className="px-4 py-3">Timestamp (UTC)</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3 text-right">CO2</th>
                  <th className="px-4 py-3 text-right">Noise</th>
                  <th className="px-4 py-3 text-right">Temp</th>
                  <th className="px-4 py-3 text-right">Humidity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#294467]/40 text-sm">
                {data.map((row) => (
                  <tr key={row.id} className="transition hover:bg-[#0E1C30]/60">
                    <td className="px-4 py-2.5 font-mono text-xs text-[#7F93B3]">
                      {new Date(row.created_at)
                        .toISOString()
                        .replace("T", " ")
                        .substring(0, 19)}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`inline-flex rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
                          row.entry_type === "manual"
                            ? "border border-amber-500/20 bg-amber-500/10 text-amber-400"
                            : "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                        }`}
                      >
                        {row.entry_type}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono">{row.co2_level}</td>
                    <td className="px-4 py-2.5 text-right font-mono">{row.noise_level}</td>
                    <td className="px-4 py-2.5 text-right font-mono">{row.temperature}</td>
                    <td className="px-4 py-2.5 text-right font-mono">{row.humidity}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {data.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-[#5A6C8A]">
                <Server className="mb-3 h-8 w-8 opacity-50" />
                <p className="text-sm">Awaiting telemetry stream...</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

const MetricCard = memo(function MetricCard({
  title,
  value,
  unit,
  icon,
  borderColor,
}: {
  title: string;
  value: string;
  unit: string;
  icon: React.ReactNode;
  borderColor: string;
}) {
  return (
    <div
      className={`rounded-2xl border bg-[#0F1523] p-5 ${borderColor} flex flex-col justify-between`}
    >
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#5A6C8A]">
          {title}
        </p>
        <div className={`rounded-md border bg-[#070B14] p-1.5 ${borderColor}`}>
          {icon}
        </div>
      </div>
      <div className="flex items-baseline gap-1.5">
        <p className="font-mono text-3xl font-medium text-white">{value}</p>
        {value !== "--" && (
          <p className="text-xs font-bold text-[#5A6C8A]">{unit}</p>
        )}
      </div>
    </div>
  );
});

export default memo(TelemetryConsole);
