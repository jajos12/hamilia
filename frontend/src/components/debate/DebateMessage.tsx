"use client";

import { motion } from "framer-motion";
import { Shield, AlertTriangle, Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DebateTurn } from "@/hooks/useDebateStream";

interface DebateMessageProps {
  turn: DebateTurn;
  index: number;
  isStreaming?: boolean;
}

const speakerConfig = {
  for: {
    label: "FOR",
    icon: Shield,
    badge: "bg-[#88D498] text-black border-[2px] border-black shadow-[2px_2px_0_0_#000]",
    bubble: "border-l-[6px] border-l-[#88D498] bg-white",
  },
  against: {
    label: "AGAINST",
    icon: AlertTriangle,
    badge: "bg-[#FF6B6B] text-black border-[2px] border-black shadow-[2px_2px_0_0_#000]",
    bubble: "border-l-[6px] border-l-[#FF6B6B] bg-white",
  },
  judge: {
    label: "JUDGE",
    icon: Scale,
    badge: "bg-[#FFD23F] text-black border-[2px] border-black shadow-[2px_2px_0_0_#000]",
    bubble: "border-l-[6px] border-l-[#FFD23F] bg-[#FFD23F]/10",
  },
};

const phaseLabels: Record<string, string> = {
  opening: "Opening",
  rebuttal_1: "Rebuttal",
  rebuttal_2: "Rebuttal",
  cross_examination: "Cross-Exam",
  crux: "Verdict",
};

export function DebateMessage({
  turn,
  index,
  isStreaming = false,
}: DebateMessageProps) {
  const config = speakerConfig[turn.speaker];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={cn(
        "flex flex-col gap-1.5",
        turn.speaker === "against" && "items-end"
      )}
    >
      {/* Speaker badge */}
      <div
        className={cn(
          "flex items-center gap-1.5",
          turn.speaker === "against" && "flex-row-reverse"
        )}
      >
        <div className={cn("flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold", config.badge)}>
          <Icon className="h-2.5 w-2.5" />
          <span>{config.label}</span>
        </div>
        <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
          {phaseLabels[turn.phase]}
        </span>
      </div>

      {/* Message bubble */}
      <div
        className={cn(
          "max-w-[90%] px-3 py-2 border-[2px] border-black",
          config.bubble,
          isStreaming && "animate-pulse-border"
        )}
      >
        <p className="text-xs leading-relaxed text-black whitespace-pre-wrap">
          {turn.content}
          {isStreaming && (
            <span className="inline-block w-1 h-3 ml-0.5 bg-black animate-pulse align-text-bottom" />
          )}
        </p>
      </div>
    </motion.div>
  );
}
