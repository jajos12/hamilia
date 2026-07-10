"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Search, GitCompare, Shield, Swords, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrutalistCard } from "@/components/shared/BrutalistCard";

const features = [
  {
    icon: Search,
    title: "Multi-Source",
    description: "arXiv, Semantic Scholar, DuckDuckGo, RSS",
    color: "bg-[#74B9FF]",
  },
  {
    icon: Zap,
    title: "NLI Stance",
    description: "Local model classifies support vs contradiction",
    color: "bg-[#FFD23F]",
  },
  {
    icon: GitCompare,
    title: "Structured Debate",
    description: "FOR vs AGAINST with citations",
    color: "bg-[#88D498]",
  },
  {
    icon: Shield,
    title: "Verification",
    description: "Every cited claim checked against source",
    color: "bg-[#FF6B6B]",
  },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FFFDF5]">
      {/* Noise overlay */}
      <div className="noise-overlay" />

      {/* Dot grid background */}
      <div className="dot-grid pointer-events-none fixed inset-0 -z-10 opacity-[0.04]" />

      {/* Giant background text */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center -z-5 overflow-hidden">
        <span className="font-display text-[20vw] font-extrabold text-black/[0.02] uppercase leading-none select-none">
          VS
        </span>
      </div>

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative min-h-screen flex flex-col">
        {/* Top marquee */}
        <div className="border-b-[3px] border-black bg-[#FFD23F] py-2 overflow-hidden">
          <div className="marquee-content">
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className="inline-flex items-center gap-4 mx-4 text-sm font-black uppercase tracking-widest text-black">
                <Swords className="h-4 w-4" />
                DIALECTICAL RAG
                <span className="text-lg">★</span>
                ADVERSARIAL EVIDENCE
                <span className="text-lg">★</span>
                TRUTH HAS TWO SIDES
                <span className="text-lg">★</span>
              </span>
            ))}
          </div>
        </div>

        {/* Main hero content */}
        <div className="flex-1 flex flex-col justify-center px-6 md:px-12 lg:px-20">
          <div className="max-w-7xl mx-auto w-full">
            {/* Broken grid layout */}
            <div className="grid grid-cols-12 gap-0">
              {/* Left column — massive text */}
              <div className="col-span-12 lg:col-span-8">
                <motion.div
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  {/* Tag */}
                  <div className="mb-6 inline-flex items-center gap-2 border-[3px] border-black bg-[#74B9FF] px-3 py-1.5 shadow-[3px_3px_0_0_#000]">
                    <span className="h-2 w-2 bg-black animate-pulse" />
                    <span className="font-mono text-[11px] font-bold uppercase tracking-widest">AGON v0.1</span>
                  </div>

                  {/* Headline */}
                  <h1 className="font-display text-[clamp(3rem,10vw,8rem)] font-extrabold leading-[0.85] tracking-tighter uppercase">
                    <span className="block">Every</span>
                    <span className="block">Claim</span>
                    <span className="block bg-[#FFD23F] px-3 text-black border-[3px] border-black shadow-[5px_5px_0_0_#000] inline-block -rotate-1">
                      Has
                    </span>
                    <span className="block">Two</span>
                    <span className="block text-[#FF6B6B]">Sides.</span>
                  </h1>
                </motion.div>
              </div>

              {/* Right column — info blocks */}
              <div className="col-span-12 lg:col-span-4 flex flex-col justify-end gap-0 mt-8 lg:mt-0">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="space-y-0"
                >
                  {/* Stat block 1 */}
                  <div className="border-[3px] border-black bg-white p-4 shadow-[4px_4px_0_0_#000]">
                    <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                      // Data Sources
                    </div>
                    <div className="font-display text-3xl font-extrabold">5+</div>
                    <div className="text-xs text-muted-foreground">arXiv, Semantic Scholar, DDG, RSS, ChromaDB</div>
                  </div>

                  {/* Stat block 2 */}
                  <div className="border-[3px] border-black border-t-0 bg-[#88D498] p-4 shadow-[4px_4px_0_0_#000]">
                    <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-black mb-1">
                      // Debate Phases
                    </div>
                    <div className="font-display text-3xl font-extrabold text-black">7</div>
                    <div className="text-xs text-black/70">Opening → Rebuttals → Cross-Exam → Crux</div>
                  </div>

                  {/* Stat block 3 */}
                  <div className="border-[3px] border-black border-t-0 bg-[#FF6B6B] p-4 shadow-[4px_4px_0_0_#000]">
                    <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-black mb-1">
                      // Mode
                    </div>
                    <div className="font-display text-3xl font-extrabold text-black">LIVE</div>
                    <div className="text-xs text-black/70">Real-time streaming with VRM avatars</div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* CTA row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-12 flex flex-wrap gap-4"
            >
              <Link href="/analyze">
                <Button size="lg" className="gap-2 px-8 text-base h-14">
                  Start Analyzing
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/debate">
                <Button size="lg" variant="outline" className="gap-2 px-8 text-base h-14 bg-[#FFD23F] border-[3px] border-black shadow-[5px_5px_0_0_#000] hover:bg-[#FFD23F]/90 text-black">
                  <Swords className="h-5 w-5" />
                  Debate Mode
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Bottom marquee */}
        <div className="border-t-[3px] border-black bg-[#FF6B6B] py-2 overflow-hidden">
          <div className="marquee-content" style={{ animationDirection: "reverse", animationDuration: "18s" }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className="inline-flex items-center gap-4 mx-4 text-sm font-black uppercase tracking-widest text-black">
                FOR
                <span className="text-lg">⚡</span>
                AGAINST
                <span className="text-lg">⚡</span>
                REBUTTAL
                <span className="text-lg">⚡</span>
                CROSS-EXAM
                <span className="text-lg">⚡</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ SCHISM DIVIDER ═══════════════ */}
      <section className="relative border-y-[3px] border-black overflow-hidden">
        <div className="flex">
          <div className="flex-1 bg-[#88D498] flex items-center justify-center py-16 border-r-[3px] border-black">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="font-display text-[clamp(4rem,12vw,10rem)] font-extrabold text-black leading-none">
                FOR
              </div>
              <div className="font-mono text-xs uppercase tracking-widest text-black/60 mt-2">
                Supporting Evidence
              </div>
            </motion.div>
          </div>

          {/* Center VS */}
          <div className="w-24 bg-black flex items-center justify-center relative shrink-0">
            {/* Jagged edges */}
            <svg className="absolute left-0 top-0 h-full w-3" viewBox="0 0 12 100" preserveAspectRatio="none" fill="none">
              <path d="M0,0 L12,2 L4,8 L12,14 L2,20 L12,26 L4,32 L12,38 L2,44 L12,50 L4,56 L12,62 L2,68 L12,74 L4,80 L12,86 L2,92 L12,98 L0,100 Z" fill="#88D498" />
            </svg>
            <svg className="absolute right-0 top-0 h-full w-3" viewBox="0 0 12 100" preserveAspectRatio="none" fill="none">
              <path d="M12,0 L0,2 L8,8 L0,14 L10,20 L0,26 L8,32 L0,38 L10,44 L0,50 L8,56 L0,62 L10,68 L0,74 L8,80 L0,86 L10,92 L0,98 L12,100 Z" fill="#FF6B6B" />
            </svg>

            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <span className="font-display text-5xl font-extrabold text-white">VS</span>
            </motion.div>
          </div>

          <div className="flex-1 bg-[#FF6B6B] flex items-center justify-center py-16 border-l-[3px] border-black">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="font-display text-[clamp(4rem,12vw,10rem)] font-extrabold text-black leading-none">
                AGAINST
              </div>
              <div className="font-mono text-xs uppercase tracking-widest text-black/60 mt-2">
                Undermining Evidence
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════ FEATURES ═══════════════ */}
      <section className="relative py-20 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <div className="font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
              // How It Works
            </div>
            <h2 className="font-display text-[clamp(2rem,5vw,4rem)] font-extrabold uppercase tracking-tight">
              The Engine
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className={`border-[3px] border-black p-6 ${feature.color} shadow-[5px_5px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[7px_7px_0_0_#000] transition-all cursor-default`}>
                  <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-black/50 mb-2">
                    0{i + 1}
                  </div>
                  <feature.icon className="h-6 w-6 text-black mb-3" />
                  <h3 className="font-heading text-lg font-black uppercase mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-black/70">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ ASCII DECORATION ═══════════════ */}
      <section className="border-y-[3px] border-black bg-black text-[#88D498] py-12 px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto font-mono text-xs leading-relaxed opacity-60">
          <pre className="whitespace-pre-wrap break-words">
{`╔══════════════════════════════════════════════════════════════╗
║  HAMILIA :: Adversarial Evidence Engine                      ║
║  ─────────────────────────────────────────────────────────── ║
║  Input:  Any claim ("Remote work is productive")             ║
║  Output: Structured debate with citations                    ║
║                                                              ║
║  Pipeline:                                                   ║
║    1. Multi-source retrieval (arXiv, S2, DDG, RSS)           ║
║    2. NLI stance detection (support/contradict/nuance)       ║
║    3. Evidence ranking & selection                           ║
║    4. 7-phase debate generation                              ║
║    5. Citation verification                                  ║
╚══════════════════════════════════════════════════════════════╝`}
          </pre>
        </div>
      </section>

      {/* ═══════════════ DEMO CLAIM ═══════════════ */}
      <section className="py-20 px-6 md:px-12 lg:px-20">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="border-[3px] border-black bg-white shadow-[8px_8px_0_0_#000]">
              <div className="border-b-[3px] border-black bg-[#FFD23F] px-5 py-3">
                <div className="font-mono text-[11px] font-bold uppercase tracking-widest text-black">
                  // Try It
                </div>
              </div>
              <div className="p-6">
                <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
                  Sample Claim
                </div>
                <p className="font-heading text-xl font-bold mb-6 leading-snug">
                  &quot;Large language models will cause mass unemployment within 10 years&quot;
                </p>
                <div className="flex items-center gap-3">
                  <Link href="/analyze">
                    <Button className="gap-2">
                      Analyze This
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/debate">
                    <Button variant="outline" className="gap-2 bg-[#FF6B6B] border-[3px] border-black shadow-[3px_3px_0_0_#000] text-black hover:bg-[#FF6B6B]/90">
                      <Swords className="h-4 w-4" />
                      Debate It
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="border-t-[3px] border-black bg-black text-white py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-[#FFD23F] flex items-center justify-center border-[3px] border-white">
              <Zap className="h-4 w-4 text-black" />
            </div>
            <span className="font-display text-lg font-extrabold uppercase tracking-tight">
              HAMILIA
            </span>
          </div>
          <div className="font-mono text-[11px] text-white/50 uppercase tracking-widest">
            Adversarial Evidence Engine — v0.1.0
          </div>
        </div>
      </footer>
    </div>
  );
}
