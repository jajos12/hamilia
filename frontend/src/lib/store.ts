import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DebateResponse } from "./api";

export interface AnalysisEntry {
  id: string;
  claim: string;
  result: DebateResponse;
  timestamp: number;
}

interface HistoryState {
  entries: AnalysisEntry[];
  addEntry: (claim: string, result: DebateResponse) => void;
  removeEntry: (id: string) => void;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      entries: [],
      addEntry: (claim, result) =>
        set((state) => ({
          entries: [
            {
              id: crypto.randomUUID(),
              claim,
              result,
              timestamp: Date.now(),
            },
            ...state.entries,
          ].slice(0, 50),
        })),
      removeEntry: (id) =>
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== id),
        })),
      clearHistory: () => set({ entries: [] }),
    }),
    { name: "hamilia-history" }
  )
);
