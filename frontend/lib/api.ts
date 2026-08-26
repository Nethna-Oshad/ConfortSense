import axios from "axios";
import type {
  AdminOverview,
  AuthUser,
  LecturerMode,
  SensorDevice,
  StudentHome,
  TelemetryRecord,
  TrendPoint,
  UserRole,
  Zone,
} from "./types";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const client = axios.create({
  baseURL: API_URL,
  timeout: 8000,
});

export async function getStudentHome() {
  const { data } = await client.get<StudentHome>("/student/home");
  return data;
}

export async function getZones(mode?: LecturerMode) {
  const { data } = await client.get<Zone[]>("/zones", { params: { mode } });
  return data;
}

export async function getZone(id: string, mode?: LecturerMode) {
  const { data } = await client.get<Zone>(`/zones/${id}`, { params: { mode } });
  return data;
}

export async function getZoneTrend(id: string) {
  const { data } = await client.get<TrendPoint[]>(`/zones/${id}/trend`);
  return data;
}

export async function getLecturerDashboard(mode?: LecturerMode) {
  const { data } = await client.get<{
    zone: Zone;
    mode: LecturerMode;
    trend: TrendPoint[];
    alerts: Array<Zone["alert"]>;
  }>("/lecturer/dashboard", { params: { mode } });
  return data;
}

export async function setLecturerMode(mode: LecturerMode) {
  const { data } = await client.post<{
    zone: Zone;
    mode: LecturerMode;
    trend: TrendPoint[];
    alerts: Array<Zone["alert"]>;
  }>("/lecturer/mode", { mode });
  return data;
}

export async function getAdminOverview() {
  const { data } = await client.get<AdminOverview>("/admin/overview");
  return data;
}

export async function getAdminSensors() {
  const { data } = await client.get<SensorDevice[]>("/admin/sensors");
  return data;
}

export async function getTelemetry() {
  const { data } = await client.get<TelemetryRecord[]>("/telemetry");
  return data;
}

export async function postTelemetry(payload: {
  co2_level: string;
  noise_level: string;
  temperature: string;
  humidity: string;
  entry_type: "manual" | "automatic";
}) {
  const { data } = await client.post<TelemetryRecord>("/telemetry", payload);
  return data;
}

export async function mockLogin(email: string, role: UserRole) {
  const { data } = await client.post<{ token: string; user: AuthUser }>(
    "/auth/mock-login",
    { email, role }
  );
  return data;
}

export async function fetchAllComfortData(mode: LecturerMode) {
  const [studentHome, zones, adminOverview, sensors, lecturerDashboard] =
    await Promise.all([
      getStudentHome(),
      getZones(mode),
      getAdminOverview(),
      getAdminSensors(),
      getLecturerDashboard(mode),
    ]);

  return { studentHome, zones, adminOverview, sensors, lecturerDashboard };
}
