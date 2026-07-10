"use client";

import { AppShell } from "@/components/layout/AppShell";
import { AnalysisInterface } from "@/components/analysis/AnalysisInterface";

export default function AnalyzePage() {
  return (
    <AppShell>
      <AnalysisInterface />
    </AppShell>
  );
}
