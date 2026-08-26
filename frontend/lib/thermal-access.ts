import type { UserRole } from "@/lib/types";

export const STUDENT_THERMAL_TYPES = ["library", "study"] as const;
export const LECTURER_THERMAL_TYPES = ["lecture", "lab"] as const;

export type StudentThermalType = (typeof STUDENT_THERMAL_TYPES)[number];
export type LecturerThermalType = (typeof LECTURER_THERMAL_TYPES)[number];

export function canViewThermal(role: UserRole, zoneType: string) {
  if (role === "admin") return true;
  if (role === "lecturer") {
    return LECTURER_THERMAL_TYPES.includes(zoneType as LecturerThermalType);
  }
  return STUDENT_THERMAL_TYPES.includes(zoneType as StudentThermalType);
}

export function isClassroomLayout(zoneType: string) {
  return zoneType === "lecture" || zoneType === "lab";
}
