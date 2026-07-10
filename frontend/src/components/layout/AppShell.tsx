"use client";

import { Sidebar } from "./Sidebar";
import { FloatingElements } from "@/components/shared/FloatingElements";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />
      <div className="pl-[220px]">
        <main className="relative min-h-screen p-6">
          <div className="dot-grid pointer-events-none fixed inset-0 -z-10 opacity-[0.03]" />
          {children}
        </main>
      </div>
    </div>
  );
}
