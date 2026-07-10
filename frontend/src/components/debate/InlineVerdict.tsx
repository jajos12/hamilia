"use client";

import { motion } from "framer-motion";
import { Scale } from "lucide-react";
import type { DebateTurn } from "@/hooks/useDebateStream";
import type { AvatarOption } from "./AvatarPicker";

interface InlineVerdictProps {
  judgeTurn: DebateTurn;
  claim: string;
  forAvatar: AvatarOption;
  againstAvatar: AvatarOption;
}

export function InlineVerdict({
  judgeTurn,
  claim,
  forAvatar,
  againstAvatar,
}: InlineVerdictProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="border-t-[4px] border-black bg-[#FFD23F] p-5"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-8 w-8 items-center justify-center border-[3px] border-black bg-white shadow-[2px_2px_0_0_#000]">
          <Scale className="h-4 w-4 text-black" />
        </div>
        <div>
          <h2 className="font-display text-lg font-extrabold tracking-tight">
            FINAL VERDICT
          </h2>
          <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-black/60">
            The judge has spoken
          </p>
        </div>
      </div>

      {/* Claim */}
      <div className="mb-3 border-[3px] border-black bg-white px-3 py-2 shadow-[3px_3px_0_0_#000]">
        <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
          Original Claim
        </p>
        <p className="text-xs font-bold">{claim}</p>
      </div>

      {/* Verdict content */}
      <div className="border-[3px] border-black bg-white px-4 py-3 shadow-[3px_3px_0_0_#000]">
        <p className="text-xs leading-relaxed whitespace-pre-wrap">
          {judgeTurn.content}
        </p>
      </div>
    </motion.div>
  );
}
