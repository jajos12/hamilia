"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Shield, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DebateResponse } from "@/lib/api";
import { ArgumentCard } from "./ArgumentCard";
import { CruxCard } from "./CruxCard";

type Tab = "for" | "against" | "crux";

const tabs: { id: Tab; label: string; icon: typeof Target; color: string; activeBg: string }[] = [
  { id: "for", label: "For", icon: Shield, color: "text-[#88D498]", activeBg: "bg-[#88D498]" },
  { id: "against", label: "Against", icon: AlertTriangle, color: "text-[#FF6B6B]", activeBg: "bg-[#FF6B6B]" },
  { id: "crux", label: "Crux", icon: Target, color: "text-[#FFD23F]", activeBg: "bg-[#FFD23F]" },
];

interface DebateViewProps {
  result: DebateResponse;
}

export function DebateView({ result }: DebateViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>("for");

  return (
    <div>
      {/* Claim header */}
      <div className="mb-4 border-[3px] border-black bg-[#FFD23F] px-4 py-3 shadow-[4px_4px_0_0_#000]">
        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-black/60">
          Claim
        </p>
        <p className="text-sm font-bold text-black">{result.original_claim}</p>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-1 border-[3px] border-black bg-white p-1 shadow-[4px_4px_0_0_#000]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold transition-all border-[3px] border-black",
              activeTab === tab.id
                ? `${tab.activeBg} text-black shadow-[3px_3px_0_0_#000] -translate-y-0.5`
                : "bg-white text-muted-foreground hover:bg-secondary shadow-none"
            )}
          >
            <tab.icon className={cn("h-4 w-4", tab.color)} />
            <span>{tab.label}</span>
            <span className="text-xs opacity-60">
              {tab.id === "for"
                ? result.for_arguments.length
                : tab.id === "against"
                  ? result.against_arguments.length
                  : ""}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "for" && (
            <div className="space-y-3">
              {result.for_arguments.map((arg, i) => (
                <ArgumentCard key={i} argument={arg} index={i} />
              ))}
            </div>
          )}

          {activeTab === "against" && (
            <div className="space-y-3">
              {result.against_arguments.map((arg, i) => (
                <ArgumentCard key={i} argument={arg} index={i} />
              ))}
            </div>
          )}

          {activeTab === "crux" && <CruxCard crux={result.crux} />}
        </motion.div>
      </AnimatePresence>

      {/* Sources footer */}
      {result.sources_used.length > 0 && (
        <div className="mt-6 border-[3px] border-black bg-white p-4 shadow-[4px_4px_0_0_#000]">
          <p className="mb-3 font-mono text-xs font-bold uppercase tracking-wider text-black">
            Sources ({result.sources_used.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {result.sources_used.map((source, i) => (
              <span
                key={i}
                className="nb-badge inline-flex items-center gap-1 bg-[#E8E4DF] px-2.5 py-1 font-mono text-[10px] font-bold text-black border-[2px] border-black shadow-[2px_2px_0_0_#000]"
              >
                {source.title.slice(0, 50)}
                {source.title.length > 50 ? "..." : ""}
              </span>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-3">
            <div className="h-3 flex-1 overflow-hidden border-[3px] border-black bg-white">
              <motion.div
                className="h-full bg-[#88D498]"
                initial={{ width: 0 }}
                animate={{
                  width: `${result.verification_score * 100}%`,
                }}
                transition={{ duration: 0.8, delay: 0.3 }}
              />
            </div>
            <span className="nb-badge bg-[#88D498] px-2 py-0.5 font-mono text-[10px] font-bold text-black border-[2px] border-black">
              {Math.round(result.verification_score * 100)}% verified
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
