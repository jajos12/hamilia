"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Shield, AlertTriangle, Loader2, Play, Square, RotateCcw } from "lucide-react";
import Link from "next/link";
import { BrutalistCard } from "@/components/shared/BrutalistCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SingleAvatarScene } from "./AvatarScene";
import { DebateChat } from "./DebateChat";
import { PhaseIndicator } from "./PhaseIndicator";
import { AvatarPicker, AVATARS, type AvatarOption } from "./AvatarPicker";
import { PhaseTransitionCard } from "./PhaseTransitionCard";
import { InlineVerdict } from "./InlineVerdict";
import { CountdownOverlay } from "./CountdownOverlay";
import { FloatingElements } from "@/components/shared/FloatingElements";
import { useDebateStream } from "@/hooks/useDebateStream";

export function DebateArena() {
  const {
    state,
    streamingText,
    isStreaming,
    error,
    showTransition,
    pendingPhase,
    pendingSpeaker,
    createDebate,
    startAutoPlay,
    stopAutoPlay,
    handleTransitionComplete,
    handleTransitionSkip,
    executeTurn,
    reset,
  } = useDebateStream();

  const [claim, setClaim] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [forAvatar, setForAvatar] = useState<AvatarOption>(AVATARS[0]);
  const [againstAvatar, setAgainstAvatar] = useState<AvatarOption>(AVATARS[1]);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownComplete, setCountdownComplete] = useState(false);

  const handleStart = async () => {
    if (!claim.trim()) return;
    setIsStarting(true);
    try {
      await createDebate(claim.trim());
      setShowCountdown(true);
    } catch {
      // error is set in hook
    } finally {
      setIsStarting(false);
    }
  };

  const handleCountdownComplete = useCallback(() => {
    setShowCountdown(false);
    setCountdownComplete(true);
    startAutoPlay("for");
  }, [startAutoPlay]);

  const activeSpeaker = isStreaming
    ? state?.turns && (state.turns.length === 0 || state.turns.length % 2 === 0)
      ? "for"
      : "against"
    : null;

  const judgeTurn = state?.turns.find((t) => t.speaker === "judge");

  // ── Not started: avatar picker + claim input ───────────────
  if (!state) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden">
        <FloatingElements />
        <Link
          href="/analyze"
          className="relative z-10 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to single-shot analysis
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative z-10 w-full max-w-2xl"
        >
          <BrutalistCard className="p-6" hover={false}>
            <div className="text-center mb-6">
              <h1 className="font-display text-4xl font-extrabold tracking-tight mb-2">
                DEBATE ARENA
              </h1>
              <p className="text-sm text-muted-foreground">
                Pick your debaters. Enter a claim. Watch them fight.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <AvatarPicker
                label="FOR"
                selected={forAvatar}
                onSelect={setForAvatar}
                accentClass="bg-[#88D498]"
              />
              <AvatarPicker
                label="AGAINST"
                selected={againstAvatar}
                onSelect={setAgainstAvatar}
                accentClass="bg-[#FF6B6B]"
              />
            </div>

            <div className="space-y-3">
              <Input
                value={claim}
                onChange={(e) => setClaim(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleStart()}
                placeholder='e.g., "Remote work is more productive than office work"'
                className="h-12 text-sm"
                disabled={isStarting}
              />

              <Button
                onClick={handleStart}
                disabled={!claim.trim() || isStarting}
                variant="default"
                className="w-full h-12 text-base"
              >
                {isStarting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Setting up debate...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Start Debate
                  </>
                )}
              </Button>
            </div>

            {error && (
              <div className="mt-4 border-[3px] border-destructive bg-destructive/10 px-4 py-3 text-sm font-bold text-destructive">
                {error}
              </div>
            )}
          </BrutalistCard>
        </motion.div>
      </div>
    );
  }

  // ── Debate in progress ─────────────────────────────────────
  return (
    <div className="h-screen flex flex-col">
      {/* Countdown overlay */}
      {showCountdown && (
        <CountdownOverlay
          onComplete={handleCountdownComplete}
          claim={state.originalClaim}
          forAvatarName={forAvatar.name}
          againstAvatarName={againstAvatar.name}
          forAvatarEmoji={forAvatar.emoji}
          againstAvatarEmoji={againstAvatar.emoji}
        />
      )}

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b-[3px] border-black bg-white shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/analyze"
            className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Link>
          <div className="h-4 w-[3px] bg-black" />
          <p className="text-xs font-bold max-w-md truncate">
            {state.originalClaim}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <PhaseIndicator
            currentPhase={state.currentPhase}
            turnCount={state.turns.length}
            isComplete={state.isComplete}
          />
          {!state.isComplete && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                stopAutoPlay();
                reset();
                setClaim("");
                setShowCountdown(false);
                setCountdownComplete(false);
              }}
              title="Stop debate"
            >
              <Square className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Main arena */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Phase transition overlay */}
        <AnimatePresence>
          {showTransition && pendingPhase && (
            <PhaseTransitionCard
              phase={pendingPhase}
              nextSpeaker={pendingSpeaker}
              onComplete={handleTransitionComplete}
              onSkip={handleTransitionSkip}
            />
          )}
        </AnimatePresence>

        {/* Avatar zone — top 75% */}
        <div className="h-[75%] flex relative shrink-0">
          {/* FOR side */}
          <div className="flex-1 flex flex-col relative bg-[#88D498]/10 min-h-0">
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center gap-2 bg-[#88D498] px-4 py-2 border-b-[3px] border-black">
              <Shield className="h-4 w-4 text-black" />
              <span className="font-heading text-sm font-bold text-black">
                {forAvatar.name} — FOR
              </span>
              <span className="ml-auto text-xl">{forAvatar.emoji}</span>
            </div>
            <div className="flex-1 mt-[44px] min-h-0">
              <SingleAvatarScene
                avatarUrl={forAvatar.file}
                isSpeaking={activeSpeaker === "for"}
                expression={
                  state.currentPhase === "cross_examination"
                    ? "challenging"
                    : "confident"
                }
                fallbackColor="#88D498"
              />
            </div>
          </div>

          {/* Schism divider */}
          <div className="relative w-[60px] shrink-0 flex flex-col items-center justify-center bg-black z-20">
            <svg
              className="absolute left-0 top-0 h-full w-3"
              viewBox="0 0 12 100"
              preserveAspectRatio="none"
              fill="none"
            >
              <path
                d="M0,0 L12,2 L4,8 L12,14 L2,20 L12,26 L4,32 L12,38 L2,44 L12,50 L4,56 L12,62 L2,68 L12,74 L4,80 L12,86 L2,92 L12,98 L0,100 Z"
                fill="var(--background)"
              />
            </svg>
            <svg
              className="absolute right-0 top-0 h-full w-3"
              viewBox="0 0 12 100"
              preserveAspectRatio="none"
              fill="none"
            >
              <path
                d="M12,0 L0,2 L8,8 L0,14 L10,20 L0,26 L8,32 L0,38 L10,44 L0,50 L8,56 L0,62 L10,68 L0,74 L8,80 L0,86 L10,92 L0,98 L12,100 Z"
                fill="var(--background)"
              />
            </svg>
            <div className="flex flex-col items-center gap-2">
              <div className="font-display text-3xl font-extrabold text-white">VS</div>
              <div className="h-[3px] w-8 bg-white" />
              <div className="font-mono text-[9px] font-bold uppercase tracking-widest text-white/70 text-center leading-tight">
                Phase{" "}
                {["opening", "rebuttal_1", "rebuttal_2", "cross_examination", "crux"].indexOf(
                  state.currentPhase
                ) + 1}
              </div>
            </div>
          </div>

          {/* AGAINST side */}
          <div className="flex-1 flex flex-col relative bg-[#FF6B6B]/10 min-h-0">
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center gap-2 bg-[#FF6B6B] px-4 py-2 border-b-[3px] border-black">
              <AlertTriangle className="h-4 w-4 text-black" />
              <span className="font-heading text-sm font-bold text-black">
                {againstAvatar.name} — AGAINST
              </span>
              <span className="ml-auto text-xl">{againstAvatar.emoji}</span>
            </div>
            <div className="flex-1 mt-[44px] min-h-0">
              <SingleAvatarScene
                avatarUrl={againstAvatar.file}
                isSpeaking={activeSpeaker === "against"}
                expression={
                  state.currentPhase === "cross_examination"
                    ? "challenging"
                    : "neutral"
                }
                rotation={[0, Math.PI, 0]}
                fallbackColor="#FF6B6B"
              />
            </div>
          </div>
        </div>

        {/* Chat zone — bottom 25% */}
        <div className="h-[25%] flex border-t-[3px] border-black overflow-hidden shrink-0 min-h-0">
          <div className="flex-1 flex flex-col border-r-[3px] border-black overflow-hidden min-w-0">
            <div className="bg-[#88D498] px-3 py-1 border-b-[2px] border-black shrink-0">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-black">
                FOR — Arguments
              </span>
            </div>
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              <DebateChat
                turns={state.turns}
                streamingText={streamingText}
                activeSpeaker={activeSpeaker}
                isStreaming={isStreaming}
                scope="for"
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            <div className="bg-[#FF6B6B] px-3 py-1 border-b-[2px] border-black shrink-0">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-black">
                AGAINST — Arguments
              </span>
            </div>
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              <DebateChat
                turns={state.turns}
                streamingText={streamingText}
                activeSpeaker={activeSpeaker}
                isStreaming={isStreaming}
                scope="against"
              />
            </div>
          </div>
        </div>

        {judgeTurn && (
          <InlineVerdict
            judgeTurn={judgeTurn}
            claim={state.originalClaim}
            forAvatar={forAvatar}
            againstAvatar={againstAvatar}
          />
        )}
      </div>

      {/* Bottom bar */}
      <div className="border-t-[3px] border-black bg-white px-4 py-3 shrink-0">
        <div className="flex items-center justify-center gap-3">
          {!state.isComplete ? (
            <>
              {isStreaming && (
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-[#88D498] animate-pulse" />
                  <span className="font-mono text-xs font-bold uppercase">
                    {activeSpeaker === "for" ? `${forAvatar.name} is speaking...` : `${againstAvatar.name} is speaking...`}
                  </span>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  stopAutoPlay();
                  reset();
                  setClaim("");
                  setShowCountdown(false);
                  setCountdownComplete(false);
                }}
                className="gap-1.5"
              >
                <Square className="h-3 w-3" />
                Stop & New
              </Button>
            </>
          ) : (
            <Button
              variant="default"
              onClick={() => {
                reset();
                setClaim("");
                setCountdownComplete(false);
              }}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              New Debate
            </Button>
          )}
        </div>

        {error && (
          <p className="text-center text-xs font-bold text-destructive mt-2">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
