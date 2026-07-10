"use client";

export interface ApiKeys {
  provider: "ollama" | "gemini" | "openrouter" | "openai";
  geminiKey: string;
  openrouterKey: string;
  openaiKey: string;
}

const STORAGE_KEY = "hamilia_api_keys";

const DEFAULTS: ApiKeys = {
  provider: "gemini",
  geminiKey: "",
  openrouterKey: "",
  openaiKey: "",
};

export function loadApiKeys(): ApiKeys {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULTS;
}

export function saveApiKeys(keys: ApiKeys): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
}

export function buildHeaders(): Record<string, string> {
  const keys = loadApiKeys();
  const headers: Record<string, string> = {};

  if (keys.provider !== "ollama") {
    headers["X-LLM-Provider"] = keys.provider;
  }

  if (keys.geminiKey) headers["X-Gemini-Key"] = keys.geminiKey;
  if (keys.openrouterKey) headers["X-OpenRouter-Key"] = keys.openrouterKey;
  if (keys.openaiKey) headers["X-OpenAI-Key"] = keys.openaiKey;

  return headers;
}

export function hasRequiredKey(): boolean {
  const keys = loadApiKeys();
  if (keys.provider === "ollama") return true;
  if (keys.provider === "gemini") return !!keys.geminiKey;
  if (keys.provider === "openrouter") return !!keys.openrouterKey;
  if (keys.provider === "openai") return !!keys.openaiKey;
  return false;
}
