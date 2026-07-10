"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { TurnPhase } from "@/hooks/useDebateStream";

interface PhaseTransitionCardProps {
  phase: TurnPhase;
  nextSpeaker: "for" | "against" | "judge";
  onComplete: () => void;
  onSkip: () => void;
}

const phaseLabels: Record<TurnPhase, string> = {
  opening: "OPENING STATEMENT",
  rebuttal_1: "REBUTTAL",
  rebuttal_2: "REBUTTAL",
  cross_examination: "CROSS-EXAMINATION",
  crux: "FINAL VERDICT",
};

const speakerLabels = {
  for: "FOR",
  against: "AGAINST",
  judge: "JUDGE",
};

const DURATION = 2500;

export function PhaseTransitionCard({
  phase,
  nextSpeaker,
  onComplete,
  onSkip,
}: PhaseTransitionCardProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(elapsed / DURATION, 1);
      setProgress(pct);
      if (pct >= 1) {
        clearInterval(interval);
        onComplete();
      }
    }, 30);
    return () => clearInterval(interval);
  }, [onComplete]);

  const accentColor =
    nextSpeaker === "for"
      ? "bg-[#88D498]"
      : nextSpeaker === "against"
        ? "bg-[#FF6B6B]"
        : "bg-[#FFD23F]";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        className="absolute inset-0 z-50 flex items-center justify-center bg-[var(--background)]/80"
      >
        <div className="flex flex-col items-center gap-4">
          {/* Phase label */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="nb-card-static bg-white px-8 py-6 text-center"
          >
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
              Next Up
            </p>
            <h2 className="font-display text-3xl font-extrabold tracking-tight">
              {phaseLabels[phase]}
            </h2>
            <div className="mt-3 flex items-center justify-center gap-2">
              <div
                className={cn("h-3 w-3 border-[2px] border-black", accentColor)}
              />
              <span className="font-heading text-sm font-bold">
                {speakerLabels[nextSpeaker]} responds
              </span>
            </div>
          </motion.div>

          {/* Progress bar */}
          <div className="h-1 w-48 overflow-hidden border-[2px] border-black bg-white">
            <motion.div
              className={cn("h-full", accentColor)}
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          {/* Skip button */}
          <button
            onClick={onSkip}
            className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip →
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
