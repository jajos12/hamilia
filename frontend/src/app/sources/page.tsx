"use client";

import { motion } from "framer-motion";
import { Database, ExternalLink } from "lucide-react";
import { BrutalistCard } from "@/components/shared/BrutalistCard";
import { AppShell } from "@/components/layout/AppShell";

const sources = [
  {
    name: "arXiv",
    description: "Academic preprints in CS, ML, AI, physics, and mathematics.",
    type: "academic",
    color: "bg-[#B8A9FA]",
    url: "https://arxiv.org",
    rateLimit: "1 req/3s",
  },
  {
    name: "Semantic Scholar",
    description: "AI/ML papers with citation graphs and influence metrics.",
    type: "academic",
    color: "bg-[#74B9FF]",
    url: "https://semanticscholar.org",
    rateLimit: "100 req/5min",
  },
  {
    name: "DuckDuckGo",
    description: "General web search for news, blogs, and opinion pieces.",
    type: "web",
    color: "bg-[#88D498]",
    url: "https://duckduckgo.com",
    rateLimit: "Soft limit",
  },
  {
    name: "RSS Feeds",
    description: "News from BBC, Guardian, TechCrunch, and more.",
    type: "news",
    color: "bg-[#FFD23F]",
    url: "#",
    rateLimit: "No limit",
  },
  {
    name: "ChromaDB",
    description: "Local vector store for pre-indexed documents.",
    type: "local",
    color: "bg-[#FFA552]",
    url: "#",
    rateLimit: "No limit",
  },
];

export default function SourcesPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-xl font-black tracking-tight uppercase">Data Sources</h1>
          <p className="text-sm text-muted-foreground">
            All sources are free, no API keys required.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {sources.map((source, i) => (
            <motion.div
              key={source.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <BrutalistCard className="p-5">
                <div className="mb-3 flex items-center gap-3">
                  <div className={`h-3 w-3 ${source.color} border-[2px] border-black`} />
                  <h3 className="text-sm font-black uppercase">{source.name}</h3>
                  {source.url !== "#" && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
                <p className="mb-3 text-xs text-muted-foreground">
                  {source.description}
                </p>
                <div className="flex items-center gap-2">
                  <span className="border-[2px] border-black bg-secondary/50 px-2 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">
                    {source.type}
                  </span>
                  <span className="text-[10px] text-muted-foreground/60">
                    {source.rateLimit}
                  </span>
                </div>
              </BrutalistCard>
            </motion.div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
