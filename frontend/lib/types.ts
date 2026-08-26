export type UserRole = "student" | "lecturer" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface ThermalBand {
  id: "front" | "middle" | "back";
  label: string;
  occupancy: number;
  density: number;
}

export interface ThermalRegionStat {
  id: string;
  label: string;
  occupancy: number;
  share: number;
}

export interface ThermalCellStat {
  row: number;
  col: number;
  celsius: number;
}

export interface ThermalFrame {
  rows: number;
  cols: number;
  ambientC: number;
  thresholdC: number;
  cells: number[][];
  studentCells?: Array<Array<number | null>>;
  studentHeadcount?: number;
  noiseGrid?: number[][];
  headcount: number;
  blobCount: number;
  settledCount: number;
  settledRatio: number;
  bands: ThermalBand[];
  hotspot: ThermalRegionStat;
  sparse: ThermalRegionStat;
  hottestCell: ThermalCellStat;
  coolestCell: ThermalCellStat;
  paletteMin: number;
  paletteMax: number;
  studentPaletteMin?: number;
  studentPaletteMax?: number;
  zoneType?: string;
  layoutKind?: "classroom" | "open";
  aisleCols?: number[];
}

export interface ZoneReadings {
  co2: number;
  noise: number;
  temperature: number;
  humidity: number;
  occupancy: number;
  settledRatio: number;
  sensorStatus: "online" | "stale" | "offline";
  lastUpdated: string;
  noiseCategory: string;
  airQuality: string;
  occupancyLabel: string;
  temperatureLabel: string;
  thermal?: ThermalFrame;
}

export interface ZoneAlert {
  id: string;
  zoneId: string;
  zoneName: string;
  severity: "info" | "warning" | "critical"; // #NNN: Added "info" for non-critical alerts like seating
  title: string;
  message: string;
  createdAt: string;
  // #NNN: Added Explainable Analytics and Actionable fields below
  reason?: string;
  recommendation?: string;
  timeToThreshold?: number; 
}

export interface Zone {
  id: string;
  name: string;
  building: string;
  floor: number;
  type: string;
  capacity: number;
  baselineNoise: number;
  readings: ZoneReadings;
  comfortIndex: number;
  comfortLabel: string;
  comfortStatus: "optimal" | "warning" | "critical";
  alerts: ZoneAlert[]; // #NNN: Changed from single object (`alert: ZoneAlert | null`) to an array of alerts
}

export interface TrendPoint {
  timestamp: string;
  comfortIndex: number;
  co2: number;
  noise: number;
  temperature: number;
}

export interface StudentHome {
  optimalZone: Zone;
  nearestZone: Zone;
  zones: Zone[];
  studentAlerts: Array<{
    id: string;
    title: string;
    message: string;
    createdAt: string;
  }>;
}

export interface AdminOverview {
  zonesMonitored: number;
  zonesOptimal: number;
  zonesWarning: number;
  zonesCritical: number;
  sensorsOnline: number;
  sensorsStale: number;
  activeAlerts: number;
  alerts: ZoneAlert[];
  zones: Zone[];
}

export interface SensorDevice {
  id: string;
  zoneId: string;
  zoneName: string;
  status: string;
  battery: number;
  signal: number;
  lastUpdated: string;
}

export type LecturerMode = "lecture" | "exam" | "group";

export interface TelemetryRecord {
  id: number;
  co2_level: string;
  noise_level: string;
  temperature: string;
  humidity: string;
  entry_type: string;
  created_at: string;
}