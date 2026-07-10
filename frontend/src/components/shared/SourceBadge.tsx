"use client";

import { cn } from "@/lib/utils";

interface SourceBadgeProps {
  source: string;
  className?: string;
}

const sourceStyles: Record<string, string> = {
  arxiv: "bg-[#B8A9FA] text-black border-black",
  semantic_scholar: "bg-[#74B9FF] text-black border-black",
  web: "bg-[#88D498] text-black border-black",
  rss: "bg-[#FFD23F] text-black border-black",
  chromadb: "bg-[#FFA552] text-black border-black",
  file: "bg-[#E8E4DF] text-black border-black",
};

const sourceLabels: Record<string, string> = {
  arxiv: "arXiv",
  semantic_scholar: "Semantic Scholar",
  web: "Web",
  rss: "News",
  chromadb: "Corpus",
  file: "File",
};

export function SourceBadge({ source, className }: SourceBadgeProps) {
  return (
    <span
      className={cn(
        "nb-badge inline-flex items-center px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider",
        sourceStyles[source] || sourceStyles.web,
        className
      )}
    >
      {sourceLabels[source] || source}
    </span>
  );
}
