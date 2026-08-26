"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function OnboardingScreen({
  step,
  totalSteps,
  title,
  description,
  icon,
  bullets,
  nextHref,
  skipHref = "/onboarding/terms",
  nextLabel = "Next →",
}: {
  step: number;
  totalSteps: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  bullets?: string[];
  nextHref: string;
  skipHref?: string;
  nextLabel?: string;
}) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0A0F1C] px-4 py-6 text-white sm:px-6 md:px-8">
      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md flex-col md:max-w-2xl lg:max-w-4xl">
        <div className="flex justify-end">
          <button
            onClick={() => router.push(skipHref)}
            className="text-sm font-semibold uppercase tracking-widest text-[#7F93B3]"
          >
            Skip
          </button>
        </div>

        <div className="grid flex-1 grid-cols-1 items-center gap-8 py-8 lg:grid-cols-2">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="mb-8 flex h-36 w-36 items-center justify-center rounded-full border border-[#294467]/70 bg-gradient-to-b from-[#0E1C30] to-[#16294A] shadow-[0_0_40px_rgba(43,127,224,0.15)]">
              {icon}
            </div>
            <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              {title}
            </h1>
            <p className="max-w-xl text-sm leading-6 text-[#7F93B3] md:text-base">
              {description}
            </p>
            {bullets && (
              <ul className="mt-6 space-y-2 text-left text-sm text-[#7F93B3] md:text-base">
                {bullets.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="text-[#3DDC84]">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-4 lg:justify-self-end lg:w-full lg:max-w-md">
            <div className="flex justify-center gap-2 lg:justify-start">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <span
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    index + 1 === step ? "w-6 bg-[#4FB8E8]" : "w-2 bg-[#294467]"
                  }`}
                />
              ))}
            </div>
            <Link
              href={nextHref}
              prefetch
              className="block rounded-2xl bg-gradient-to-r from-[#2B7FE0] to-[#4FB8E8] py-4 text-center text-sm font-bold uppercase tracking-wide text-white shadow-[0_10px_30px_rgba(43,127,224,0.25)]"
            >
              {nextLabel}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
