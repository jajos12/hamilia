"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, AlertTriangle } from "lucide-react";

interface CountdownOverlayProps {
  onComplete: () => void;
  claim: string;
  forAvatarName: string;
  againstAvatarName: string;
  forAvatarEmoji: string;
  againstAvatarEmoji: string;
}

export function CountdownOverlay({
  onComplete,
  claim,
  forAvatarName,
  againstAvatarName,
  forAvatarEmoji,
  againstAvatarEmoji,
}: CountdownOverlayProps) {
  const [count, setCount] = useState(10);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (count <= 0) {
      setDone(true);
      onComplete();
      return;
    }
    const timer = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [count, onComplete]);

  const progress = ((10 - count) / 10) * 100;

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
        >
          {/* Blurred backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />

          {/* Content */}
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: -10 }}
            transition={{ type: "spring", bounce: 0.2 }}
            className="relative z-10 flex flex-col items-center gap-6 px-8"
          >
            {/* VS matchup */}
            <div className="flex items-center gap-6">
              {/* FOR */}
              <motion.div
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="flex h-20 w-20 items-center justify-center border-[4px] border-[#88D498] bg-white shadow-[4px_4px_0_0_#88D498]">
                  <span className="text-4xl">{forAvatarEmoji}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#88D498] px-3 py-1 border-[2px] border-black shadow-[2px_2px_0_0_#000]">
                  <Shield className="h-3 w-3 text-black" />
                  <span className="font-heading text-xs font-bold text-black">
                    {forAvatarName}
                  </span>
                </div>
              </motion.div>

              {/* Countdown number */}
              <div className="flex flex-col items-center gap-3">
                <motion.div
                  key={count}
                  initial={{ scale: 1.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: "spring", bounce: 0.3 }}
                  className="font-display text-8xl font-extrabold text-white"
                  style={{
                    textShadow: "4px 4px 0 0 #000, -1px -1px 0 0 #000, 1px -1px 0 0 #000, -1px 1px 0 0 #000",
                  }}
                >
                  {count}
                </motion.div>

                {/* Progress bar */}
                <div className="w-40 h-2 border-[2px] border-black bg-white overflow-hidden">
                  <motion.div
                    className="h-full bg-[#FFD23F]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>

                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-white/80">
                  Starting debate...
                </span>
              </div>

              {/* AGAINST */}
              <motion.div
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="flex h-20 w-20 items-center justify-center border-[4px] border-[#FF6B6B] bg-white shadow-[4px_4px_0_0_#FF6B6B]">
                  <span className="text-4xl">{againstAvatarEmoji}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#FF6B6B] px-3 py-1 border-[2px] border-black shadow-[2px_2px_0_0_#000]">
                  <AlertTriangle className="h-3 w-3 text-black" />
                  <span className="font-heading text-xs font-bold text-black">
                    {againstAvatarName}
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Claim */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="max-w-lg border-[3px] border-black bg-white px-5 py-3 shadow-[4px_4px_0_0_#000]"
            >
              <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                The Claim
              </p>
              <p className="text-sm font-bold text-center">
                &ldquo;{claim}&rdquo;
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
