"use client";

import { motion } from "framer-motion";
import type { Argument } from "@/lib/api";
import { StanceTag } from "@/components/shared/StanceTag";

interface ArgumentCardProps {
  argument: Argument;
  index: number;
}

const strengthAccents = {
  strong: {
    border: "border-l-[8px] border-l-[#88D498]",
    badge: "bg-[#88D498] shadow-[2px_2px_0_0_#000]",
  },
  moderate: {
    border: "border-l-[8px] border-l-[#FFD23F]",
    badge: "bg-[#FFD23F] shadow-[2px_2px_0_0_#000]",
  },
  weak: {
    border: "border-l-[8px] border-l-[#E8E4DF]",
    badge: "bg-[#E8E4DF] shadow-[2px_2px_0_0_#000]",
  },
};

const verificationAccents = {
  VALID: "bg-[#88D498] shadow-[2px_2px_0_0_#000]",
  PARTIAL: "bg-[#FFD23F] shadow-[2px_2px_0_0_#000]",
  INVALID: "bg-[#FF6B6B] shadow-[2px_2px_0_0_#000]",
};

export function ArgumentCard({ argument, index }: ArgumentCardProps) {
  const accent = strengthAccents[argument.strength];

  return (
    <motion.div
      className={`nb-card-static border-[3px] border-black p-4 bg-white ${accent.border}`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
    >
      <div className="mb-2 flex items-center gap-2 flex-wrap">
        <StanceTag stance={argument.stance} />
        <span className={`nb-badge px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black border-[2px] border-black ${accent.badge}`}>
          {argument.strength}
        </span>
        {argument.verification_status && (
          <span className={`nb-badge px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black border-[2px] border-black ${verificationAccents[argument.verification_status]}`}>
            {argument.verification_status}
          </span>
        )}
      </div>

      <p className="mb-3 text-sm leading-relaxed">{argument.claim}</p>

      {argument.sources.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {argument.sources.map((source, i) => (
            <span
              key={i}
              className="nb-badge inline-flex items-center gap-1 bg-[#E8E4DF] px-2 py-0.5 font-mono text-[9px] font-bold text-black border-[2px] border-black shadow-[1px_1px_0_0_#000]"
            >
              {source.length > 50 ? source.slice(0, 50) + "..." : source}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
