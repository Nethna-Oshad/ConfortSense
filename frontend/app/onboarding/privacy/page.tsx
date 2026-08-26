"use client";

import { Shield } from "lucide-react";
import OnboardingScreen from "@/components/comfort/OnboardingScreen";

export default function PrivacyOnboardingPage() {
  return (
    <OnboardingScreen
      step={1}
      totalSteps={3}
      title="Privacy-First Sensing"
      description="We monitor environments, not people. ComfortSense uses thermal and acoustic feature extraction to assess room health."
      icon={<Shield className="h-14 w-14 text-[#4FB8E8]" />}
      bullets={["No Cameras", "No Audio Recording", "Edge Processing"]}
      nextHref="/onboarding/intro"
    />
  );
}
