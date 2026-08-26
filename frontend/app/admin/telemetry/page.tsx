import dynamic from "next/dynamic";

const TelemetryConsole = dynamic(
  () => import("@/components/comfort/TelemetryConsole"),
  {
    loading: () => (
      <div className="h-64 animate-pulse rounded-2xl bg-[#0E1C30]" />
    ),
  }
);

export default function AdminTelemetryPage() {
  return <TelemetryConsole />;
}
