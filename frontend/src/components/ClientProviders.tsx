"use client";

import { ApiKeyModal } from "@/components/settings/ApiKeyModal";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ApiKeyModal />
    </>
  );
}
