"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Clock, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrutalistCard } from "@/components/shared/BrutalistCard";
import { StanceTag } from "@/components/shared/StanceTag";
import { AppShell } from "@/components/layout/AppShell";
import { useHistoryStore } from "@/lib/store";

export default function HistoryPage() {
  const { entries, removeEntry, clearHistory } = useHistoryStore();

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black tracking-tight uppercase">Analysis History</h1>
            <p className="text-sm text-muted-foreground">
              {entries.length} previous analyses
            </p>
          </div>
          {entries.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearHistory}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Clear all
            </Button>
          )}
        </div>

        {entries.length === 0 ? (
          <BrutalistCard className="p-12 text-center" hover={false}>
            <Clock className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              No analyses yet. Start by analyzing a claim.
            </p>
            <Link href="/analyze" className="mt-4 inline-block">
              <Button size="sm" className="gap-1.5">
                Analyze a claim
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </BrutalistCard>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <BrutalistCard className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="mb-1.5 text-sm font-bold truncate">
                        {entry.claim}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>
                          {new Date(entry.timestamp).toLocaleDateString()}
                        </span>
                        <span className="h-1 w-1 bg-border" />
                        <div className="flex gap-1.5">
                          <StanceTag stance="FOR" />
                          <span className="text-muted-foreground">
                            {entry.result.for_arguments.length}
                          </span>
                          <StanceTag stance="AGAINST" />
                          <span className="text-muted-foreground">
                            {entry.result.against_arguments.length}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Link href={`/analyze`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeEntry(entry.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </BrutalistCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
