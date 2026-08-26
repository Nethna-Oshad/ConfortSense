"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { markOnboardingComplete, markTermsAccepted } from "@/lib/auth";

export default function TermsPage() {
  const router = useRouter();
  const [accepted, setAccepted] = useState(false);

  const handleContinue = () => {
    markOnboardingComplete();
    markTermsAccepted();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#0A0F1C] px-4 py-6 text-white sm:px-6 md:px-8">
      <div className="relative mx-auto w-full max-w-md space-y-6 md:max-w-2xl lg:max-w-3xl">
        <div>
          <Link
            href="/onboarding/intro"
            className="mb-3 inline-flex items-center gap-2 text-sm text-[#7F93B3] transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <p className="text-xs uppercase tracking-widest text-[#7F93B3]">
            Terms & Privacy
          </p>
          <h1 className="mt-2 text-2xl font-bold md:text-3xl">
            Review our data collection policies
          </h1>
        </div>

        <div className="rounded-2xl border border-[#294467]/60 bg-[#0E1C30] p-5 text-sm leading-6 text-[#7F93B3] md:p-6 md:text-base">
          <h2 className="mb-3 text-base font-semibold text-white md:text-lg">
            Data Collection & Anonymization
          </h2>
          <p className="mb-4">
            ComfortSense uses IoT sensors to monitor room health. All data is anonymized
            at the sensor level and never includes video, audio recordings, or personal
            identity information.
          </p>
          <ul className="space-y-2">
            <li>• Thermal occupancy via infrared signatures</li>
            <li>• Air quality via CO2, temperature, and humidity</li>
            <li>• Acoustic levels via decibel feature extraction</li>
          </ul>
        </div>

        <label className="flex items-start gap-3 rounded-2xl border border-[#294467]/60 bg-[#0E1C30] p-4">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(event) => setAccepted(event.target.checked)}
            className="mt-1"
          />
          <span className="text-sm text-[#7F93B3]">I accept the terms and conditions.</span>
        </label>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            disabled={!accepted}
            onClick={handleContinue}
            className="rounded-2xl bg-gradient-to-r from-[#2B7FE0] to-[#4FB8E8] py-4 text-sm font-bold uppercase tracking-wide disabled:opacity-40 sm:col-span-2"
          >
            Accept and Continue
          </button>
          <button
            onClick={() => router.push("/onboarding/privacy")}
            className="rounded-2xl border border-[#294467]/70 py-4 text-sm font-semibold uppercase tracking-wide text-[#7F93B3] sm:col-span-2"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
