"use client";

import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { FloatingElements } from "@/components/shared/FloatingElements";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />
      <div className="pl-[220px]">
        <Header />
        <main className="relative min-h-[calc(100vh-56px)] p-6">
          <div className="dot-grid pointer-events-none fixed inset-0 -z-10 opacity-[0.03]" />
          <FloatingElements />
          {children}
        </main>
      </div>
    </div>
  );
}
