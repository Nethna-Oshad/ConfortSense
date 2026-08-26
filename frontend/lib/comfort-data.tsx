"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  fetchAllComfortData,
  getTelemetry,
  getZoneTrend,
  setLecturerMode as setLecturerModeApi,
} from "@/lib/api";
import type {
  AdminOverview,
  LecturerMode,
  SensorDevice,
  StudentHome,
  TrendPoint,
  Zone,
} from "@/lib/types";

interface ComfortDataState {
  studentHome: StudentHome | null;
  zones: Zone[];
  adminOverview: AdminOverview | null;
  sensors: SensorDevice[];
  lecturerDashboard: {
    zone: Zone;
    mode: LecturerMode;
    trend: TrendPoint[];
    alerts: Array<Zone["alert"]>;
  } | null;
  lecturerMode: LecturerMode;
  trendCache: Record<string, TrendPoint[]>;
  ready: boolean;
}

interface ComfortDataContextValue extends ComfortDataState {
  setLecturerMode: (mode: LecturerMode) => Promise<void>;
  getZoneById: (id: string) => Zone | undefined;
  getZoneTrendCached: (id: string) => Promise<TrendPoint[]>;
  refreshTelemetry: () => Promise<void>;
}

const ComfortDataContext = createContext<ComfortDataContextValue | null>(null);

const POLL_MS = 5000;

export function ComfortDataProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ComfortDataState>({
    studentHome: null,
    zones: [],
    adminOverview: null,
    sensors: [],
    lecturerDashboard: null,
    lecturerMode: "lecture",
    trendCache: {},
    ready: false,
  });

  const lecturerModeRef = useRef<LecturerMode>("lecture");
  const inFlightRef = useRef(false);

  const refreshAll = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    try {
      const data = await fetchAllComfortData(lecturerModeRef.current);
      setState((prev) => ({
        ...prev,
        studentHome: data.studentHome,
        zones: data.zones,
        adminOverview: data.adminOverview,
        sensors: data.sensors,
        lecturerDashboard: data.lecturerDashboard,
        ready: true,
      }));
    } catch (error) {
      console.error("Comfort data refresh failed:", error);
    } finally {
      inFlightRef.current = false;
    }
  }, []);

  useEffect(() => {
    refreshAll();
    const interval = setInterval(refreshAll, POLL_MS);
    return () => clearInterval(interval);
  }, [refreshAll]);

  const setLecturerMode = useCallback(async (mode: LecturerMode) => {
    lecturerModeRef.current = mode;
    setState((prev) => ({ ...prev, lecturerMode: mode }));

    try {
      const data = await setLecturerModeApi(mode);
      setState((prev) => ({
        ...prev,
        lecturerDashboard: data,
        lecturerMode: mode,
      }));
    } catch (error) {
      console.error("Failed to set lecturer mode:", error);
    }
  }, []);

  const getZoneById = useCallback(
    (id: string) => state.zones.find((zone) => zone.id === id),
    [state.zones]
  );

  const getZoneTrendCached = useCallback(async (id: string) => {
    const cached = state.trendCache[id];
    if (cached?.length) return cached;

    const trend = await getZoneTrend(id);
    setState((prev) => ({
      ...prev,
      trendCache: { ...prev.trendCache, [id]: trend },
    }));
    return trend;
  }, [state.trendCache]);

  const refreshTelemetry = useCallback(async () => {
    await getTelemetry();
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      setLecturerMode,
      getZoneById,
      getZoneTrendCached,
      refreshTelemetry,
    }),
    [state, setLecturerMode, getZoneById, getZoneTrendCached, refreshTelemetry]
  );

  return (
    <ComfortDataContext.Provider value={value}>
      {children}
    </ComfortDataContext.Provider>
  );
}

export function useComfortData() {
  const context = useContext(ComfortDataContext);
  if (!context) {
    throw new Error("useComfortData must be used within ComfortDataProvider");
  }
  return context;
}
