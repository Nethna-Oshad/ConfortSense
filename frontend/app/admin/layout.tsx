"use client";

import AppShell from "@/components/comfort/AppShell";
import { ComfortDataProvider } from "@/lib/comfort-data";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ComfortDataProvider>
      <AppShell role="admin">{children}</AppShell>
    </ComfortDataProvider>
  );
}
