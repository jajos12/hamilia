"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, X, Eye, EyeOff, Check, AlertCircle } from "lucide-react";
import { loadApiKeys, saveApiKeys, hasRequiredKey, ApiKeys } from "@/lib/apiKeys";

const PROVIDERS = [
  { id: "gemini" as const, label: "Google Gemini", free: true },
  { id: "openrouter" as const, label: "OpenRouter", free: true },
  { id: "openai" as const, label: "OpenAI", free: false },
  { id: "ollama" as const, label: "Ollama (Local)", free: true },
];

export function ApiKeyModal() {
  const [open, setOpen] = useState(false);
  const [keys, setKeys] = useState<ApiKeys>({
    provider: "gemini",
    geminiKey: "",
    openrouterKey: "",
    openaiKey: "",
    ollamaUrl: "http://localhost:11434",
  });
  const [showGemini, setShowGemini] = useState(false);
  const [showOpenrouter, setShowOpenrouter] = useState(false);
  const [showOpenai, setShowOpenai] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setKeys(loadApiKeys());
  }, [open]);

  const handleSave = () => {
    saveApiKeys(keys);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const isValid = hasRequiredKey();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 border-[3px] border-black bg-[#FFD23F] px-4 py-3 font-mono text-xs font-bold uppercase tracking-widest text-black shadow-[4px_4px_0_0_#000] transition-all hover:shadow-[2px_2px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
      >
        <Settings className="h-4 w-4" />
        API Keys
        {!isValid && (
          <span className="ml-1 inline-block h-2 w-2 rounded-full bg-[#FF6B6B]" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-4 z-[70] mx-auto my-auto max-h-[90vh] max-w-lg overflow-y-auto border-[3px] border-black bg-white shadow-[8px_8px_0_0_#000] sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b-[3px] border-black bg-[#FFD23F] px-6 py-4">
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-black" />
                  <h2 className="font-display text-lg font-extrabold uppercase tracking-tight text-black">
                    API Configuration
                  </h2>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="border-[3px] border-black bg-white p-1 shadow-[2px_2px_0_0_#000] transition-all hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Provider selector */}
                <div>
                  <label className="block font-mono text-[10px] font-bold uppercase tracking-widest text-black/50 mb-3">
                    // Provider
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {PROVIDERS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() =>
                          setKeys({ ...keys, provider: p.id })
                        }
                        className={`border-[3px] border-black px-3 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-all ${
                          keys.provider === p.id
                            ? "bg-[#FFD23F] shadow-[3px_3px_0_0_#000]"
                            : "bg-white shadow-[2px_2px_0_0_#000] hover:bg-gray-50"
                        }`}
                      >
                        {p.label}
                        {p.free && (
                          <span className="ml-1 text-[9px] text-[#88D498]">
                            FREE
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gemini key */}
                {keys.provider === "gemini" && (
                  <div>
                    <label className="block font-mono text-[10px] font-bold uppercase tracking-widest text-black/50 mb-2">
                      // Gemini API Key
                    </label>
                    <div className="relative">
                      <input
                        type={showGemini ? "text" : "password"}
                        value={keys.geminiKey}
                        onChange={(e) =>
                          setKeys({ ...keys, geminiKey: e.target.value })
                        }
                        placeholder="AIza..."
                        className="w-full border-[3px] border-black bg-white px-4 py-3 font-mono text-sm placeholder:text-black/30 focus:outline-none focus:ring-0 focus:shadow-[5px_5px_0_0_#FFD23F]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowGemini(!showGemini)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black"
                      >
                        {showGemini ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <p className="mt-2 font-mono text-[10px] text-black/40">
                      Get yours at{" "}
                      <span className="text-[#74B9FF]">
                        aistudio.google.com
                      </span>{" "}
                      — generous free tier
                    </p>
                  </div>
                )}

                {/* OpenRouter key */}
                {keys.provider === "openrouter" && (
                  <div>
                    <label className="block font-mono text-[10px] font-bold uppercase tracking-widest text-black/50 mb-2">
                      // OpenRouter API Key
                    </label>
                    <div className="relative">
                      <input
                        type={showOpenrouter ? "text" : "password"}
                        value={keys.openrouterKey}
                        onChange={(e) =>
                          setKeys({ ...keys, openrouterKey: e.target.value })
                        }
                        placeholder="sk-or-..."
                        className="w-full border-[3px] border-black bg-white px-4 py-3 font-mono text-sm placeholder:text-black/30 focus:outline-none focus:ring-0 focus:shadow-[5px_5px_0_0_#FFD23F]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOpenrouter(!showOpenrouter)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black"
                      >
                        {showOpenrouter ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <p className="mt-2 font-mono text-[10px] text-black/40">
                      Access 400+ models at{" "}
                      <span className="text-[#74B9FF]">openrouter.ai</span> —
                      many free models available
                    </p>
                  </div>
                )}

                {/* OpenAI key */}
                {keys.provider === "openai" && (
                  <div>
                    <label className="block font-mono text-[10px] font-bold uppercase tracking-widest text-black/50 mb-2">
                      // OpenAI API Key
                    </label>
                    <div className="relative">
                      <input
                        type={showOpenai ? "text" : "password"}
                        value={keys.openaiKey}
                        onChange={(e) =>
                          setKeys({ ...keys, openaiKey: e.target.value })
                        }
                        placeholder="sk-..."
                        className="w-full border-[3px] border-black bg-white px-4 py-3 font-mono text-sm placeholder:text-black/30 focus:outline-none focus:ring-0 focus:shadow-[5px_5px_0_0_#FFD23F]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOpenai(!showOpenai)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black"
                      >
                        {showOpenai ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <p className="mt-2 font-mono text-[10px] text-black/40">
                      Get yours at{" "}
                      <span className="text-[#74B9FF]">platform.openai.com</span>
                    </p>
                  </div>
                )}

                {/* Ollama URL */}
                {keys.provider === "ollama" && (
                  <div>
                    <label className="block font-mono text-[10px] font-bold uppercase tracking-widest text-black/50 mb-2">
                      // Ollama Base URL
                    </label>
                    <input
                      type="text"
                      value={keys.ollamaUrl}
                      onChange={(e) =>
                        setKeys({ ...keys, ollamaUrl: e.target.value })
                      }
                      placeholder="http://localhost:11434"
                      className="w-full border-[3px] border-black bg-white px-4 py-3 font-mono text-sm placeholder:text-black/30 focus:outline-none focus:ring-0 focus:shadow-[5px_5px_0_0_#FFD23F]"
                    />
                    <p className="mt-2 font-mono text-[10px] text-black/40">
                      Local: <span className="text-[#88D498]">http://localhost:11434</span> —
                      Remote: use ngrok/Cloudflare tunnel or a VPS URL
                    </p>
                  </div>
                )}

                {/* Save button */}
                <button
                  onClick={handleSave}
                  className={`w-full border-[3px] border-black px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest transition-all ${
                    saved
                      ? "bg-[#88D498] shadow-[3px_3px_0_0_#000]"
                      : "bg-[#FFD23F] shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
                  }`}
                >
                  {saved ? (
                    <span className="flex items-center justify-center gap-2">
                      <Check className="h-4 w-4" /> Saved
                    </span>
                  ) : (
                    "Save Configuration"
                  )}
                </button>

                {/* Status indicator */}
                <div className="flex items-center gap-2 border-[3px] border-black bg-black px-4 py-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      isValid ? "bg-[#88D498]" : "bg-[#FF6B6B]"
                    }`}
                  />
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-white">
                    {isValid ? "Ready to debate" : "API key required"}
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
