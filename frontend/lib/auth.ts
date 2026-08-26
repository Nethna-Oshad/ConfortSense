"use client";

import type { AuthUser, UserRole } from "./types";

const ONBOARDING_KEY = "comfortsense-onboarding-complete";
const TERMS_KEY = "comfortsense-terms-accepted";

// #NNN: Admin ha anith users lage session data wenama store karanna keys deka
const ADMIN_AUTH_KEY = "adminInfo";
const USER_AUTH_KEY = "userInfo";

export function getStoredAuth(): AuthUser | null {
  if (typeof window === "undefined") return null;
  
  // Mulinma admin session ekak thiyenawada balanawa
  const adminRaw = localStorage.getItem(ADMIN_AUTH_KEY);
  if (adminRaw) {
    try {
      return JSON.parse(adminRaw) as AuthUser;
    } catch {}
  }

  // Nathnam normal user session ekak thiyenawada balanawa
  const userRaw = localStorage.getItem(USER_AUTH_KEY);
  if (userRaw) {
    try {
      return JSON.parse(userRaw) as AuthUser;
    } catch {}
  }
  
  return null;
}

export function saveAuth(user: AuthUser) {
  // #NNN: Admin login wenawanam 'adminInfo' ekata save karanawa, nathnam 'userInfo' ekata
  if (user.role === "admin") {
    localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(user));
  } else {
    localStorage.setItem(USER_AUTH_KEY, JSON.stringify(user));
  }
}

export function clearAuth() {
  localStorage.removeItem(ADMIN_AUTH_KEY);
  localStorage.removeItem(USER_AUTH_KEY);
}

export function hasCompletedOnboarding() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(ONBOARDING_KEY) === "true";
}

export function markOnboardingComplete() {
  localStorage.setItem(ONBOARDING_KEY, "true");
}

export function hasAcceptedTerms() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(TERMS_KEY) === "true";
}

export function markTermsAccepted() {
  localStorage.setItem(TERMS_KEY, "true");
}

export function getRoleHome(role: UserRole) {
  switch (role) {
    case "student":
      return "/student/home";
    case "lecturer":
      return "/lecturer/rooms"; // #NNN: Lecturer dan kelinma Rooms selection ekata yanawa
    case "admin":
      return "/admin/overview";
    default:
      return "/login";
  }
}

export function getFirstRoute() {
  if (!hasCompletedOnboarding()) return "/onboarding/privacy";
  if (!hasAcceptedTerms()) return "/onboarding/terms";
  const auth = getStoredAuth();
  if (!auth) return "/login";
  return getRoleHome(auth.role);
}