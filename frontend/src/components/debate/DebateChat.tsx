"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { DebateMessage } from "./DebateMessage";
import type { DebateTurn } from "@/hooks/useDebateStream";

interface DebateChatProps {
  turns: DebateTurn[];
  streamingText: string;
  activeSpeaker: "for" | "against" | "judge" | null;
  isStreaming: boolean;
  scope?: "for" | "against" | "all";
}

export function DebateChat({
  turns,
  streamingText,
  activeSpeaker,
  isStreaming,
  scope = "all",
}: DebateChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [turns, streamingText]);

  const filteredTurns =
    scope === "all"
      ? turns
      : turns.filter((t) => t.speaker === scope || t.speaker === "judge");

  const hasStreamingMessage =
    isStreaming &&
    streamingText.length > 0 &&
    (scope === "all" || activeSpeaker === scope);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
    >
      <AnimatePresence mode="popLayout">
        {filteredTurns.map((turn, i) => (
          <DebateMessage key={turn.turn_id} turn={turn} index={i} />
        ))}

        {hasStreamingMessage && (
          <DebateMessage
            key="streaming"
            turn={{
              turn_id: -1,
              phase: "opening",
              speaker: activeSpeaker || "for",
              content: streamingText,
              sources: [],
              timestamp: Date.now(),
            }}
            index={filteredTurns.length}
            isStreaming
          />
        )}
      </AnimatePresence>

      {filteredTurns.length === 0 && !isStreaming && (
        <div className="flex flex-col items-center justify-center h-full text-center py-12">
          <p className="font-heading text-sm font-bold text-muted-foreground">
            Waiting for arguments...
          </p>
        </div>
      )}
    </div>
  );
}
