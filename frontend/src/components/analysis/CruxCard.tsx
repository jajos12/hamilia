"use client";

import { motion } from "framer-motion";
import { Target } from "lucide-react";

interface CruxCardProps {
  crux: string;
}

export function CruxCard({ crux }: CruxCardProps) {
  return (
    <motion.div
      className="nb-card-static border-[3px] border-black border-l-[8px] border-l-[#FFD23F] bg-[#FFD23F]/10 p-5"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center bg-[#FFD23F] border-[2px] border-black shadow-[2px_2px_0_0_#000]">
          <Target className="h-3 w-3 text-black" />
        </div>
        <span className="font-heading text-sm font-bold">
          The Real Disagreement
        </span>
      </div>
      <p className="text-sm leading-relaxed">{crux}</p>
    </motion.div>
  );
}
