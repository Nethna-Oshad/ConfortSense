"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Radio } from "lucide-react";
import { getRoleHome, saveAuth } from "@/lib/auth";
import { mockLogin } from "@/lib/api";
import type { UserRole } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@university.edu");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (role: UserRole) => {
    setLoading(true);
    
    // #NNN: Lecturer nam aniwaryenma rooms page ekata yanna assign karanawa
    const destination = role === "lecturer" ? "/lecturer/rooms" : getRoleHome(role);

    try {
      const result = await mockLogin(email, role);
      saveAuth(result.user);
      
      // #NNN: router.push wenuwata window.location.href use karanawa cache eka bypass karanna
      window.location.href = destination;
      
    } catch {
      saveAuth({
        id: `${role}-demo`,
        name:
          role === "student"
            ? "Alex Student"
            : role === "lecturer"
              ? "Dr. Morgan"
              : "Campus Admin",
        email,
        role,
      });
      
      // #NNN: router.push wenuwata window.location.href use karanawa
      window.location.href = destination;
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1C] px-4 py-8 text-white sm:px-6 md:px-8">
      <div className="relative mx-auto w-full max-w-md space-y-8 md:max-w-2xl lg:max-w-4xl lg:py-12">
        <div className="text-center lg:text-left">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-[#294467]/70 bg-gradient-to-b from-[#0E1C30] to-[#16294A] lg:mx-0">
            <Radio className="h-10 w-10 text-[#4FB8E8]" />
          </div>
          <h1 className="text-3xl font-bold md:text-4xl">ComfortSense</h1>
          <p className="mt-2 text-sm text-[#7F93B3] md:text-base">
            Academic Environment Monitor
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#294467]/60 bg-[#0E1C30] p-5 md:p-6">
            <p className="mb-4 text-xs uppercase tracking-widest text-[#7F93B3]">
              Admin & Lecturer Login
            </p>
            <div className="space-y-4">
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email Address"
                className="w-full rounded-xl border border-[#294467]/70 bg-[#0B1220] px-4 py-3 text-sm outline-none focus:border-[#4FB8E8]"
              />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                className="w-full rounded-xl border border-[#294467]/70 bg-[#0B1220] px-4 py-3 text-sm outline-none focus:border-[#4FB8E8]"
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  disabled={loading}
                  onClick={() => handleSignIn("admin")}
                  className="rounded-xl bg-gradient-to-r from-[#2B7FE0] to-[#4FB8E8] py-3 text-sm font-bold uppercase tracking-wide"
                >
                  Sign In as Admin
                </button>
                <button
                  disabled={loading}
                  onClick={() => handleSignIn("lecturer")}
                  className="rounded-xl border border-[#294467]/70 py-3 text-sm font-semibold uppercase tracking-wide text-[#7F93B3]"
                >
                  Sign In as Lecturer
                </button>
              </div>
              <button className="text-sm text-[#4FB8E8]">Forgot Password?</button>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <div className="mb-4 flex items-center gap-3 lg:hidden">
              <div className="h-px flex-1 bg-[#294467]" />
              <span className="text-xs uppercase tracking-widest text-[#5A6C8A]">
                Students
              </span>
              <div className="h-px flex-1 bg-[#294467]" />
            </div>
            <p className="mb-4 hidden text-xs uppercase tracking-widest text-[#5A6C8A] lg:block">
              Students
            </p>
            <button
              disabled={loading}
              onClick={() => handleSignIn("student")}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#294467]/70 bg-[#0E1C30] py-4 text-sm font-semibold transition hover:border-[#4FB8E8]/40"
            >
              <GraduationCap className="h-5 w-5 text-[#4FB8E8]" />
              Continue as Student
            </button>
            <p className="mt-3 text-center text-xs text-[#5A6C8A] lg:text-left">
              No login required. View live classroom conditions instantly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}