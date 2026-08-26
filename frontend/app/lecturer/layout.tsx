"use client";

import AppShell from "@/components/comfort/AppShell";
import { ComfortDataProvider } from "@/lib/comfort-data";

export default function LecturerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ComfortDataProvider>
      <AppShell role="lecturer">{children}</AppShell>
    </ComfortDataProvider>
  );
}
