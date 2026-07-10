"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, AlertCircle, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrutalistCard } from "@/components/shared/BrutalistCard";
import { DebateView } from "@/components/analysis/DebateView";
import { analyzeClaim, type DebateResponse } from "@/lib/api";
import { useHistoryStore } from "@/lib/store";

export function AnalysisInterface() {
  const [claim, setClaim] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DebateResponse | null>(null);
  const addEntry = useHistoryStore((s) => s.addEntry);

  const handleAnalyze = async () => {
    if (!claim.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await analyzeClaim(claim.trim());
      setResult(response);
      addEntry(claim.trim(), response);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "An error occurred during analysis."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      {/* Input section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <BrutalistCard className="p-6" hover={false}>
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="font-heading text-lg font-bold">
                Analyze a Claim
              </h2>
              <p className="text-sm text-muted-foreground">
                Enter a claim to find supporting and contradicting evidence from
                multiple sources.
              </p>
            </div>
            <Link
              href="/debate"
              className="nb-badge flex items-center gap-1.5 bg-primary px-3 py-1.5 text-xs font-bold text-black shrink-0"
            >
              <Swords className="h-3.5 w-3.5" />
              Debate Mode
            </Link>
          </div>

          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={claim}
                onChange={(e) => setClaim(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                placeholder='e.g., "Large language models will cause mass unemployment"'
                className="h-12 pl-10 text-sm"
                disabled={loading}
              />
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={!claim.trim() || loading}
              className="h-12 px-6"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Analyze"
              )}
            </Button>
          </div>
        </BrutalistCard>
      </motion.div>

      {/* Loading state */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-6"
          >
            <BrutalistCard className="p-8" hover={false}>
              <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 border-[3px] border-black animate-pulse-border" />
                <div className="text-center">
                  <p className="font-heading text-sm font-bold">
                    Analyzing claim...
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Searching multiple sources and generating debate
                  </p>
                </div>
                <div className="flex gap-2">
                  {["Retrieving", "Tagging", "Synthesizing", "Verifying"].map(
                    (step, i) => (
                      <motion.span
                        key={step}
                        className="nb-badge bg-primary px-2.5 py-1 text-[10px] font-bold text-black"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.5 }}
                      >
                        {step}
                      </motion.span>
                    )
                  )}
                </div>
              </div>
            </BrutalistCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error state */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6"
          >
            <BrutalistCard className="p-6" hover={false}>
              <div className="flex items-center gap-3 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <div>
                  <p className="text-sm font-bold">Analysis failed</p>
                  <p className="text-xs text-muted-foreground">{error}</p>
                </div>
              </div>
            </BrutalistCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-6"
          >
            <DebateView result={result} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
