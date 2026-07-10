"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Scale, X } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import type { DebateTurn } from "@/hooks/useDebateStream";

interface VerdictOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  judgeTurn: DebateTurn | null;
  claim: string;
}

export function VerdictOverlay({
  isOpen,
  onClose,
  judgeTurn,
  claim,
}: VerdictOverlayProps) {
  return (
    <AnimatePresence>
      {isOpen && judgeTurn && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            onClick={(e) => e.stopPropagation()}
          >
            <GlassCard className="max-w-2xl w-full p-8" hover={false}>
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/20">
                    <Scale className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Judge&apos;s Verdict</h2>
                    <p className="text-xs text-muted-foreground">
                      The crux of the disagreement
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Claim */}
              <div className="mb-6 rounded-xl border border-border bg-card/30 px-4 py-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  Original Claim
                </p>
                <p className="text-sm font-medium">{claim}</p>
              </div>

              {/* Verdict content */}
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-5 py-4">
                <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                  {judgeTurn.content}
                </p>
              </div>

              {/* Footer */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={onClose}
                  className="rounded-lg bg-primary/10 border border-primary/20 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
                >
                  Close
                </button>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
