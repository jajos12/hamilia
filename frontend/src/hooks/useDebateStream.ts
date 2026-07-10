"use client";

import { useState, useCallback, useRef } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export type TurnPhase =
  | "opening"
  | "rebuttal_1"
  | "rebuttal_2"
  | "cross_examination"
  | "crux";

export interface DebateTurn {
  turn_id: number;
  phase: TurnPhase;
  speaker: "for" | "against" | "judge";
  content: string;
  sources: Array<Record<string, unknown>>;
  timestamp: number;
  question?: string;
}

export interface DebateState {
  sessionId: string;
  originalClaim: string;
  turns: DebateTurn[];
  currentPhase: TurnPhase;
  isComplete: boolean;
  nextSpeaker: "for" | "against" | "judge";
}

interface StreamEvent {
  type: string;
  [key: string]: unknown;
}

function parseSSEChunk(chunk: string): StreamEvent[] {
  const events: StreamEvent[] = [];
  const lines = chunk.split("\n");

  let currentEvent = "";
  let currentData = "";

  for (const line of lines) {
    if (line.startsWith("event: ")) {
      currentEvent = line.slice(7).trim();
    } else if (line.startsWith("data: ")) {
      currentData = line.slice(6);
      if (currentEvent && currentData) {
        try {
          events.push({ type: currentEvent, ...JSON.parse(currentData) });
        } catch {
          events.push({ type: currentEvent, text: currentData });
        }
        currentEvent = "";
        currentData = "";
      }
    }
  }

  return events;
}

// Determine who speaks next based on turn count
function getNextSpeaker(turnCount: number): "for" | "against" {
  // After turn 0 (FOR opening) -> turnCount=1 -> next=AGAINST
  // After turn 1 (AGAINST opening) -> turnCount=2 -> next=FOR
  // After turn 2 (FOR rebuttal) -> turnCount=3 -> next=AGAINST
  // So: odd turnCount -> AGAINST, even turnCount -> FOR
  return turnCount % 2 === 1 ? "against" : "for";
}

export function useDebateStream() {
  const [state, setState] = useState<DebateState | null>(null);
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTransition, setShowTransition] = useState(false);
  const [pendingPhase, setPendingPhase] = useState<TurnPhase | null>(null);
  const [pendingSpeaker, setPendingSpeaker] = useState<"for" | "against" | "judge">("for");
  const abortRef = useRef<AbortController | null>(null);
  const textAccumulator = useRef("");
  const autoPlayRef = useRef(false);
  const stateRef = useRef<DebateState | null>(null);

  // Keep stateRef in sync
  if (state !== stateRef.current) {
    stateRef.current = state;
  }

  const createDebate = useCallback(async (claim: string) => {
    const url = API_BASE
      ? `${API_BASE}/api/v1/debate/create`
      : `/api/v1/debate/create`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ claim }),
    });

    if (!res.ok) throw new Error(`Failed to create debate: ${res.status}`);

    const data = await res.json();
    const newState: DebateState = {
      sessionId: data.session_id,
      originalClaim: data.original_claim,
      turns: data.turns,
      currentPhase: data.current_phase,
      isComplete: data.is_complete,
      nextSpeaker: "for",
    };
    setState(newState);
    stateRef.current = newState;
    return data.session_id;
  }, []);

  const executeTurn = useCallback(
    async (speaker: "for" | "against" | "judge") => {
      const currentState = stateRef.current;
      if (!currentState || isStreaming) return;

      setIsStreaming(true);
      setStreamingText("");
      textAccumulator.current = "";
      setError(null);

      const url = API_BASE
        ? `${API_BASE}/api/v1/debate/${currentState.sessionId}/turn`
        : `/api/v1/debate/${currentState.sessionId}/turn`;

      try {
        abortRef.current = new AbortController();

        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: currentState.sessionId,
            phase: currentState.currentPhase,
            speaker,
          }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) throw new Error(`Turn failed: ${res.status}`);
        if (!res.body) throw new Error("No response body");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const block of lines) {
            const events = parseSSEChunk(block);
            for (const evt of events) {
              if (evt.type === "token" && typeof evt.text === "string") {
                textAccumulator.current += evt.text;
                setStreamingText(textAccumulator.current);
              } else if (evt.type === "argument_complete") {
                const content = textAccumulator.current;
                const turn: DebateTurn = {
                  turn_id: evt.turn_id as number,
                  phase: evt.phase as TurnPhase,
                  speaker: evt.speaker as DebateTurn["speaker"],
                  content,
                  sources: [],
                  timestamp: Date.now(),
                };
                setState((prev) =>
                  prev
                    ? { ...prev, turns: [...prev.turns, turn] }
                    : prev
                );
                textAccumulator.current = "";
                setStreamingText("");
              } else if (evt.type === "phase_complete") {
                const nextPhase = evt.next_phase as TurnPhase | null;
                const isComplete = evt.is_complete as boolean;

                setState((prev) => {
                  if (!prev) return prev;
                  const newTurnCount = prev.turns.length;
                  return {
                    ...prev,
                    currentPhase: nextPhase || prev.currentPhase,
                    isComplete,
                    nextSpeaker: isComplete
                      ? "judge"
                      : getNextSpeaker(newTurnCount),
                  };
                });

                // Auto-play: show transition or continue
                if (!isComplete && nextPhase && autoPlayRef.current) {
                  // Use a timeout to let setState settle, then read fresh state
                  setTimeout(() => {
                    const freshState = stateRef.current;
                    if (!freshState || freshState.isComplete) return;

                    const next = getNextSpeaker(freshState.turns.length);
                    setPendingPhase(nextPhase);
                    setPendingSpeaker(next);
                    setShowTransition(true);
                  }, 50);
                }
              } else if (evt.type === "error") {
                setError(evt.message as string);
              }
            }
          }
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Stream failed");
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [isStreaming]
  );

  const handleTransitionComplete = useCallback(() => {
    setShowTransition(false);
    if (pendingPhase && pendingSpeaker && stateRef.current && !stateRef.current.isComplete) {
      executeTurn(pendingSpeaker);
    }
  }, [pendingPhase, pendingSpeaker, executeTurn]);

  const handleTransitionSkip = useCallback(() => {
    setShowTransition(false);
    if (pendingPhase && pendingSpeaker && stateRef.current && !stateRef.current.isComplete) {
      executeTurn(pendingSpeaker);
    }
  }, [pendingPhase, pendingSpeaker, executeTurn]);

  const startAutoPlay = useCallback(
    (firstSpeaker: "for" | "against" | "judge") => {
      autoPlayRef.current = true;
      executeTurn(firstSpeaker);
    },
    [executeTurn]
  );

  const stopAutoPlay = useCallback(() => {
    autoPlayRef.current = false;
    abortRef.current?.abort();
  }, []);

  const reset = useCallback(() => {
    setState(null);
    stateRef.current = null;
    setStreamingText("");
    setIsStreaming(false);
    setError(null);
    setShowTransition(false);
    setPendingPhase(null);
    autoPlayRef.current = false;
    textAccumulator.current = "";
  }, []);

  return {
    state,
    streamingText,
    isStreaming,
    error,
    showTransition,
    pendingPhase,
    pendingSpeaker,
    createDebate,
    executeTurn,
    startAutoPlay,
    stopAutoPlay,
    handleTransitionComplete,
    handleTransitionSkip,
    reset,
  };
}
