"use client";

import { cn } from "@/lib/utils";

interface StanceTagProps {
  stance: "SUPPORT" | "CONTRADICT" | "NUANCE" | "FOR" | "AGAINST";
  className?: string;
}

const stanceStyles = {
  SUPPORT: "bg-[#88D498] text-black border-black",
  FOR: "bg-[#88D498] text-black border-black",
  CONTRADICT: "bg-[#FF6B6B] text-black border-black",
  AGAINST: "bg-[#FF6B6B] text-black border-black",
  NUANCE: "bg-[#FFD23F] text-black border-black",
};

export function StanceTag({ stance, className }: StanceTagProps) {
  return (
    <span
      className={cn(
        "nb-badge inline-flex items-center px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider",
        stanceStyles[stance],
        className
      )}
    >
      {stance}
    </span>
  );
}
