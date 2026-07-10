"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { TurnPhase } from "@/hooks/useDebateStream";

interface PhaseIndicatorProps {
  currentPhase: TurnPhase;
  turnCount: number;
  isComplete: boolean;
}

const phases: { id: TurnPhase; label: string; short: string }[] = [
  { id: "opening", label: "Opening", short: "1" },
  { id: "rebuttal_1", label: "Rebuttal 1", short: "2" },
  { id: "rebuttal_2", label: "Rebuttal 2", short: "3" },
  { id: "cross_examination", label: "Cross-Exam", short: "4" },
  { id: "crux", label: "Verdict", short: "5" },
];

export function PhaseIndicator({
  currentPhase,
  turnCount,
  isComplete,
}: PhaseIndicatorProps) {
  const currentIdx = phases.findIndex((p) => p.id === currentPhase);

  return (
    <div className="flex items-center gap-1 px-3">
      {phases.map((phase, i) => {
        const isPast = i < currentIdx;
        const isCurrent = i === currentIdx;

        return (
          <div key={phase.id} className="flex items-center gap-1">
            <motion.div
              className={cn(
                "flex h-7 w-7 items-center justify-center border-[2px] border-black text-[11px] font-bold",
                isPast && "bg-[#88D498] text-black",
                isCurrent && "bg-primary text-black shadow-[2px_2px_0_0_#000]",
                !isPast && !isCurrent && "bg-secondary text-muted-foreground"
              )}
              animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {isPast ? "✓" : phase.short}
            </motion.div>

            {i < phases.length - 1 && (
              <div
                className={cn(
                  "h-[3px] w-3",
                  isPast ? "bg-black" : "bg-secondary"
                )}
              />
            )}
          </div>
        );
      })}

      {isComplete && (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="ml-2 font-mono text-[10px] font-bold uppercase tracking-wider text-[#FFD23F]"
        >
          Complete
        </motion.span>
      )}
    </div>
  );
}
