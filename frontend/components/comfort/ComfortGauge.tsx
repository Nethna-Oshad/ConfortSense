import { statusBg, statusColor } from "@/lib/comfort";

export default function ComfortGauge({
  score,
  label,
  size = "lg",
}: {
  score: number;
  label: string;
  size?: "md" | "lg";
}) {
  const radius = size === "lg" ? 54 : 42;
  const stroke = 8;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  const status =
    score >= 75 ? "optimal" : score >= 50 ? "warning" : "critical";

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg height={radius * 2} width={radius * 2}>
          <circle
            stroke="#16294A"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke="url(#comfortGradient)"
            fill="transparent"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset: offset, transition: "stroke-dashoffset 0.6s ease" }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            transform={`rotate(-90 ${radius} ${radius})`}
          />
          <defs>
            <linearGradient id="comfortGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2B7FE0" />
              <stop offset="100%" stopColor="#4FB8E8" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-mono text-3xl font-bold ${statusColor(status)}`}>
            {score}
          </span>
          <span className="text-xs uppercase tracking-widest text-[#7F93B3]">
            {label}
          </span>
        </div>
      </div>
      <span
        className={`mt-3 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusBg(status)} ${statusColor(status)}`}
      >
        Study-Comfort Index
      </span>
    </div>
  );
}
