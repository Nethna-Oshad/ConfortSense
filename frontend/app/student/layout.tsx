"use client";

import AppShell from "@/components/comfort/AppShell";
import { ComfortDataProvider } from "@/lib/comfort-data";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ComfortDataProvider>
      <AppShell role="student">{children}</AppShell>
    </ComfortDataProvider>
  );
}
