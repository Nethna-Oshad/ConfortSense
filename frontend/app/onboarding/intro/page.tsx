"use client";

import { Radio } from "lucide-react";
import OnboardingScreen from "@/components/comfort/OnboardingScreen";

export default function IntroOnboardingPage() {
  return (
    <OnboardingScreen
      step={2}
      totalSteps={3}
      title="ComfortSense"
      description="Your companion for quiet, comfortable study across campus."
      icon={<Radio className="h-14 w-14 text-[#4FB8E8]" />}
      nextHref="/onboarding/terms"
      nextLabel="Get Started →"
    />
  );
}
