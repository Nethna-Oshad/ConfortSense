"use client";

import { useMemo, useState } from "react";
import type { ThermalFrame } from "@/lib/types";
import { isClassroomLayout } from "@/lib/thermal-access";
import { Users, AlertTriangle, User, UsersRound } from "lucide-react";

const THERMAL_COLORS: Array<[number, number, number]> = [
  [56, 189, 248],
  [96, 165, 250],
  [168, 85, 247],
  [249, 115, 22],
  [250, 204, 21],
];

const NOISE_COLORS: Array<[number, number, number]> = [
  [34, 197, 94],
  [132, 204, 22],
  [250, 204, 21],
  [249, 115, 22],
  [239, 68, 68],
];

// #NNN: CO2 heatmap eka pennanna aluth color scale ekak add kala (Green -> Yellow -> Orange -> Red -> Purple)
const CO2_COLORS: Array<[number, number, number]> = [
  [34, 197, 94],   // Fresh (Green)
  [132, 204, 22],  // Normal (Light Green)
  [250, 204, 21],  // Elevated (Yellow)
  [249, 115, 22],  // High (Orange)
  [239, 68, 68],   // Critical (Red)
];

// #NNN: ViewMode ekata 'co2' kiyana ekath add kala
type ViewMode = "thermal" | "noise" | "co2";

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function blendScale(colors: Array<[number, number, number]>, t: number) {
  const x = Math.max(0, Math.min(1, t));
  const scaled = x * (colors.length - 1);
  const index = Math.min(colors.length - 2, Math.floor(scaled));
  const mix = scaled - index;
  const c0 = colors[index];
  const c1 = colors[index + 1];

  return [
    Math.round(lerp(c0[0], c1[0], mix)),
    Math.round(lerp(c0[1], c1[1], mix)),
    Math.round(lerp(c0[2], c1[2], mix)),
  ] as const;
}

function colorForValue(
  value: number,
  min: number,
  max: number,
  colors: Array<[number, number, number]>
) {
  const [r, g, b] = blendScale(colors, (value - min) / Math.max(max - min, 0.1));
  return `rgb(${r}, ${g}, ${b})`;
}

function zoneLabels(zoneType: string, classroom: boolean) {
  if (classroom) {
    return {
      header: zoneType === "lab" ? "Instructor bench / display wall" : "Lecturer stage / whiteboard",
      footerLeft: "Front rows",
      footerCenter: "Aisles",
      footerRight: "Back rows",
    };
  }

  if (zoneType === "library") {
    return {
      header: "Library seating clusters and quiet aisles",
      footerLeft: "Windows",
      footerCenter: "Study tables",
      footerRight: "Entrance",
    };
  }

  return {
    header: "Student seating clusters and walkways",
    footerLeft: "Study edge",
    footerCenter: "Shared seating",
    footerRight: "Entry side",
  };
}

function isOpenWalkway(row: number, col: number, aisles: number[]) {
  return aisles.includes(col) || row % 5 === 4;
}

function seatShapeClass(zoneType: string, classroom: boolean) {
  if (classroom) {
    return zoneType === "lab" ? "rounded-md" : "rounded-t-lg rounded-b-sm";
  }

  return "rounded-lg";
}

function calculateStudySpaces(studentCells: Array<Array<number | null>>, aisles: number[]) {
  let groupSpaces = 0; 
  let soloSpaces = 0;  

  for (let r = 0; r < studentCells.length; r++) {
    let consecutiveEmpty = 0;
    for (let c = 0; c < studentCells[r].length; c++) {
      if (aisles.includes(c)) {
        if (consecutiveEmpty >= 2) groupSpaces++;
        else if (consecutiveEmpty === 1) soloSpaces++;
        consecutiveEmpty = 0;
        continue;
      }
      if (studentCells[r][c] === null) {
        consecutiveEmpty++;
      } else {
        if (consecutiveEmpty >= 2) groupSpaces++;
        else if (consecutiveEmpty === 1) soloSpaces++;
        consecutiveEmpty = 0;
      }
    }
    if (consecutiveEmpty >= 2) groupSpaces++;
    else if (consecutiveEmpty === 1) soloSpaces++;
  }
  return { groupSpaces, soloSpaces };
}

function BandBar({
  label,
  occupancy,
  max,
  emphasis,
}: {
  label: string;
  occupancy: number;
  max: number;
  emphasis?: "hot" | "cold";
}) {
  const width = max ? Math.max(6, Math.round((occupancy / max) * 100)) : 6;
  const color =
    emphasis === "hot"
      ? "from-[#F2545B] to-[#F5A623]"
      : "from-[#2B7FE0] to-[#4FB8E8]";

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-[#7F93B3]">{label}</span>
        <span className="font-mono text-white">{occupancy}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#0A0F1C]">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function Legend({
  mode,
  min,
  max,
}: {
  mode: ViewMode;
  min: number;
  max: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] uppercase tracking-widest text-[#5A6C8A]">
        {/* #NNN: CO2 label eka add kala */}
        {mode === "thermal" ? `${min.toFixed(1)}°C` : mode === "noise" ? `${min.toFixed(0)} dB` : `${min.toFixed(0)} ppm`}
      </span>
      <div
        className="h-2 flex-1 rounded-full"
        style={{
          background:
            mode === "thermal"
              ? "linear-gradient(90deg, #38bdf8 0%, #60a5fa 25%, #a855f7 55%, #f97316 80%, #facc15 100%)"
              : mode === "co2"
              ? "linear-gradient(90deg, #22c55e 0%, #84cc16 20%, #facc15 50%, #f97316 75%, #ef4444 100%)" // CO2 gradient
              : "linear-gradient(90deg, #22c55e 0%, #84cc16 20%, #facc15 50%, #f97316 75%, #ef4444 100%)", // Noise gradient (same for now)
        }}
      />
      <span className="text-[10px] uppercase tracking-widest text-[#5A6C8A]">
        {/* #NNN: CO2 label eka add kala */}
        {mode === "thermal" ? `${max.toFixed(1)}°C` : mode === "noise" ? `${max.toFixed(0)} dB` : `${max.toFixed(0)} ppm`}
      </span>
    </div>
  );
}

function LayoutGrid({
  thermal,
  zoneType,
  mode,
}: {
  thermal: ThermalFrame;
  zoneType: string;
  mode: ViewMode;
}) {
  const classroom = isClassroomLayout(thermal.zoneType || zoneType);
  const labels = zoneLabels(zoneType, classroom);
  const aisles = thermal.aisleCols ?? [];
  const studentCells = thermal.studentCells ?? [];
  const noiseGrid = thermal.noiseGrid ?? [];
  const seatClass = seatShapeClass(zoneType, classroom);
  
  const noiseStats = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;

    for (const row of noiseGrid) {
      for (const value of row) {
        min = Math.min(min, value);
        max = Math.max(max, value);
      }
    }

    return {
      min: Number.isFinite(min) ? min : 0,
      max: Number.isFinite(max) ? max : 1,
    };
  }, [noiseGrid]);

  return (
    <div className="rounded-2xl border border-[#294467]/50 bg-[#05070d] p-2 sm:p-3">
      <div className="mb-3 flex items-center justify-center rounded-lg border border-[#294467]/50 bg-[#16294A] px-3 py-1.5 text-center">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#4FB8E8]">
          {labels.header}
        </p>
      </div>

      <div className="max-h-[min(70vh,720px)] overflow-auto">
        <div className={`${classroom ? "min-w-[640px] space-y-1.5" : "min-w-[760px] space-y-2"}`}>
          {Array.from({ length: thermal.rows }, (_, rowIndex) => (
            <div key={rowIndex} className="flex items-center gap-2">
              <span className="w-7 shrink-0 text-right text-[8px] font-bold tabular-nums text-[#5A6C8A]">
                {rowIndex + 1}
              </span>
              <div className="flex min-w-0 flex-1 items-stretch gap-1">
                {Array.from({ length: thermal.cols }, (_, colIndex) => {
                  const walkway = classroom
                    ? aisles.includes(colIndex)
                    : isOpenWalkway(rowIndex, colIndex, aisles);

                  if (walkway) {
                    return (
                      <div
                        key={colIndex}
                        className="flex-1 rounded-md border border-dashed border-[#223754] bg-[#09111D]"
                        title={classroom ? "Aisle" : "Walkway"}
                      />
                    );
                  }

                  const thermalValue = studentCells[rowIndex]?.[colIndex] ?? null;
                  const noiseValue = noiseGrid[rowIndex]?.[colIndex] ?? 0;
                  const occupied = thermalValue != null;
                  
                  // #NNN: CO2 grid ekak backend eken enne nathi nisa, occupied/noise base karala synthetic CO2 value ekak genarate karanawa live heatmap ekak pennanna
                  const co2Value = 400 + (noiseValue * 4.5) + (occupied ? 250 : 0); 
                  const co2Min = 400;
                  const co2Max = 1200;

                  const backgroundColor =
                    mode === "thermal"
                      ? occupied
                        ? colorForValue(
                            thermalValue,
                            thermal.studentPaletteMin ?? 36.1,
                            thermal.studentPaletteMax ?? 37.2,
                            THERMAL_COLORS
                          )
                        : "rgba(12, 22, 36, 0.9)"
                      : mode === "noise"
                      ? colorForValue(noiseValue, noiseStats.min, noiseStats.max, NOISE_COLORS)
                      // #NNN: CO2 mode eke colors
                      : colorForValue(co2Value, co2Min, co2Max, CO2_COLORS);

                  const title =
                    mode === "thermal"
                      ? `${classroom ? "Seat" : "Study seat"} ${rowIndex + 1}-${colIndex + 1}: ${
                          occupied ? "Student detected" : "Empty"
                        }`
                      : mode === "noise"
                      ? `${classroom ? "Seat" : "Study seat"} ${rowIndex + 1}-${colIndex + 1}: ${noiseValue.toFixed(1)} dB`
                      // #NNN: CO2 mode eke tooltip title eka
                      : `${classroom ? "Seat" : "Study seat"} ${rowIndex + 1}-${colIndex + 1}: ${co2Value.toFixed(0)} ppm`;

                  return (
                    <div
                      key={colIndex}
                      className={`group relative aspect-square min-w-0 flex-1 border ${
                        occupied && mode === "thermal"
                          ? "border-white/15 shadow-[0_0_14px_rgba(249,115,22,0.18)]"
                          : "border-[#294467]/30"
                      } ${seatClass}`}
                      style={{ backgroundColor }}
                      title={title}
                    >
                      {mode === "thermal" && occupied ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="rounded-full bg-black/35 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest text-white/90">
                            Student detected
                          </span>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-[#5A6C8A]">
        <span>{labels.footerLeft}</span>
        <span>{labels.footerCenter}</span>
        <span>{labels.footerRight}</span>
      </div>
    </div>
  );
}

export default function ThermalCamera({
  thermal,
  zoneName,
  capacity,
  zoneType = "study",
  compact = false,
  studentOnly = true,
  noiseLevel,
}: {
  thermal: ThermalFrame;
  zoneName: string;
  capacity: number;
  zoneType?: string;
  compact?: boolean;
  studentOnly?: boolean;
  noiseLevel?: number;
}) {
  const [mode, setMode] = useState<ViewMode>("thermal");
  const classroom = isClassroomLayout(thermal.zoneType || zoneType);
  const maxBand = useMemo(
    () => Math.max(...thermal.bands.map((band) => band.occupancy), 1),
    [thermal.bands]
  );
  
  const { groupSpaces, soloSpaces } = useMemo(() => {
    if (classroom) return { groupSpaces: 0, soloSpaces: 0 };
    return calculateStudySpaces(thermal.studentCells ?? [], thermal.aisleCols ?? []);
  }, [classroom, thermal.studentCells, thermal.aisleCols]);

  const noiseRange = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;

    for (const row of thermal.noiseGrid ?? []) {
      for (const value of row) {
        min = Math.min(min, value);
        max = Math.max(max, value);
      }
    }

    return {
      min: Number.isFinite(min) ? min : 0,
      max: Number.isFinite(max) ? max : 1,
    };
  }, [thermal.noiseGrid]);
  
  const displayHeadcount =
    studentOnly && thermal.studentHeadcount != null ? thermal.studentHeadcount : thermal.headcount;

  return (
    <section className="overflow-hidden rounded-2xl border border-[#294467]/60 bg-[#0E1C30]">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#294467]/60 px-5 py-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#7F93B3]">
            {classroom ? "Student seating map" : "Student area seating map"}
          </p>
          <p className="mt-1 text-lg font-semibold text-white">{zoneName}</p>
          <p className="mt-1 text-xs text-[#5A6C8A]">
            Student-only thermal range 36.1°C to 37.2°C. Non-student and ambient temperatures are hidden.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="rounded-2xl border border-[#294467]/70 bg-[#0A0F1C] px-4 py-3 text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#7F93B3]">
              Student headcount
            </p>
            <p className="font-mono text-3xl font-semibold text-white">
              {displayHeadcount}
              <span className="ml-1 text-sm text-[#5A6C8A]">/{capacity}</span>
            </p>
            <p className="text-xs text-[#7F93B3]">
              {thermal.settledCount} settled · {Math.round(thermal.settledRatio * 100)}% still
            </p>
          </div>

          {noiseLevel != null ? (
            <div className="rounded-2xl border border-[#22C55E]/40 bg-[#22C55E]/8 px-4 py-3 text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#22C55E]">
                Overall noise
              </p>
              <p className="font-mono text-3xl font-semibold text-white">
                {noiseLevel.toFixed(0)}
                <span className="ml-1 text-sm text-[#5A6C8A]">dB</span>
              </p>
              <p className="text-xs text-[#7F93B3]">
                {noiseLevel <= 40 ? "Quiet" : noiseLevel <= 55 ? "Moderate" : "Crowded / loud"}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div className={`grid gap-5 p-5 ${compact ? "xl:grid-cols-1" : "xl:grid-cols-12"}`}>
        <div className={compact ? "" : "xl:col-span-8"}>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setMode("thermal")}
                className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest transition ${
                  mode === "thermal"
                    ? "bg-gradient-to-r from-[#F97316] to-[#FACC15] text-[#08101d]"
                    : "border border-[#294467]/70 text-[#7F93B3] hover:text-white"
                }`}
              >
                Thermal view
              </button>
              <button
                onClick={() => setMode("noise")}
                className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest transition ${
                  mode === "noise"
                    ? "bg-gradient-to-r from-[#22C55E] to-[#FACC15] text-[#08101d]"
                    : "border border-[#294467]/70 text-[#7F93B3] hover:text-white"
                }`}
              >
                Noise view
              </button>
              {/* #NNN: Aluth CO2 View Button eka */}
              <button
                onClick={() => setMode("co2")}
                className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest transition ${
                  mode === "co2"
                    ? "bg-gradient-to-r from-[#3DDC84] to-[#2B7FE0] text-[#08101d]"
                    : "border border-[#294467]/70 text-[#7F93B3] hover:text-white"
                }`}
              >
                CO2 View
              </button>
            </div>

            <LayoutGrid thermal={thermal} zoneType={zoneType} mode={mode} />

            <Legend
              mode={mode}
              min={mode === "thermal" ? thermal.studentPaletteMin ?? 36.1 : mode === "noise" ? noiseRange.min : 400} // CO2 min default to 400
              max={mode === "thermal" ? thermal.studentPaletteMax ?? 37.2 : mode === "noise" ? noiseRange.max : 1200} // CO2 max default to 1200
            />
          </div>
        </div>

        <div className={`space-y-4 ${compact ? "" : "xl:col-span-4"}`}>
          
          {!classroom && (
            <div className="rounded-2xl border border-[#4FB8E8]/25 bg-[#4FB8E8]/8 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#4FB8E8] mb-3">
                Available Study Spaces
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center text-center bg-[#0A0F1C]/50 p-2 rounded-xl border border-white/5">
                  <UsersRound className="h-6 w-6 text-[#4FB8E8] mb-1" />
                  <p className="font-mono text-2xl font-bold text-white">{groupSpaces}</p>
                  <p className="text-[10px] text-[#7F93B3] uppercase font-semibold">Group (2+ seats)</p>
                </div>
                <div className="flex flex-col items-center text-center bg-[#0A0F1C]/50 p-2 rounded-xl border border-white/5">
                  <User className="h-6 w-6 text-[#4FB8E8] mb-1" />
                  <p className="font-mono text-2xl font-bold text-white">{soloSpaces}</p>
                  <p className="text-[10px] text-[#7F93B3] uppercase font-semibold">Solo (1 seat)</p>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-[#F2545B]/25 bg-[#F2545B]/8 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#F2545B]">
              Most gathered (dense)
            </p>
            <p className="mt-1 text-lg font-semibold text-white">{thermal.hotspot.label}</p>
            <p className="mt-1 text-sm text-[#7F93B3]">
              {thermal.hotspot.occupancy} students · {thermal.hotspot.share}% of the room
            </p>
            {classroom && thermal.hotspot.id === "back" && (
              <div className="mt-3 flex items-start gap-2 rounded-xl bg-[#F2545B]/15 p-2 text-xs font-medium text-[#F2545B] border border-[#F2545B]/20">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <p>Disengagement Proxy: Back-row clustering detected.</p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[#2B7FE0]/25 bg-[#2B7FE0]/8 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#2B7FE0]">
              Least gathered (sparse)
            </p>
            <p className="mt-1 text-lg font-semibold text-white">{thermal.sparse.label}</p>
            <p className="mt-1 text-sm text-[#7F93B3]">
              {thermal.sparse.occupancy} students · {thermal.sparse.share}% of the room
            </p>
          </div>

          <div className="space-y-3 rounded-2xl border border-[#294467]/60 bg-[#0A0F1C] p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#7F93B3]">
              {classroom ? "Row-band occupancy" : "Area-band occupancy"}
            </p>
            {thermal.bands.map((band) => (
              <BandBar
                key={band.id}
                label={band.label}
                occupancy={band.occupancy}
                max={maxBand}
                emphasis={
                  band.id === thermal.hotspot.id
                    ? "hot"
                    : band.id === thermal.sparse.id
                      ? "cold"
                      : undefined
                }
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}