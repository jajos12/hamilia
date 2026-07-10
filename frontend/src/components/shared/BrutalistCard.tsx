"use client";

import { cn } from "@/lib/utils";

interface BrutalistCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function BrutalistCard({
  children,
  className,
  hover = true,
}: BrutalistCardProps) {
  return (
    <div className={cn(hover ? "nb-card" : "nb-card-static", className)}>
      {children}
    </div>
  );
}
