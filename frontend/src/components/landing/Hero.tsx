"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Search, GitCompare, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrutalistCard } from "@/components/shared/BrutalistCard";
import { FloatingElements } from "@/components/shared/FloatingElements";

const features = [
  {
    icon: Search,
    title: "Multi-Source Retrieval",
    description:
      "Searches arXiv, Semantic Scholar, DuckDuckGo, and RSS feeds simultaneously.",
  },
  {
    icon: Zap,
    title: "NLI Stance Detection",
    description:
      "Classifies each source as supporting, contradicting, or nuanced using a local NLI model.",
  },
  {
    icon: GitCompare,
    title: "Structured Debate",
    description:
      "Generates a structured FOR vs AGAINST debate with citations preserved.",
  },
  {
    icon: Shield,
    title: "Citation Verification",
    description:
      "Verifies that every cited claim is actually supported by its source.",
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Grid dot background */}
      <div className="dot-grid pointer-events-none fixed inset-0 -z-10 opacity-[0.04]" />

      {/* Floating elements */}
      <FloatingElements />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">
        {/* Hero */}
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial="initial"
          animate="animate"
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="mb-6">
            <span className="nb-badge inline-flex items-center gap-1.5 bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider">
              <span className="h-1.5 w-1.5 bg-black animate-pulse" />
              Dialectical RAG
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="mb-4 font-display text-5xl font-extrabold tracking-tight sm:text-7xl"
          >
            Every claim has
            <br />
            <span className="bg-[#FFD23F] px-2 text-black">two sides</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mx-auto mb-8 max-w-xl text-lg text-muted-foreground"
          >
            The Adversarial Evidence Engine finds both supporting and
            undermining evidence for any claim, structuring them into a genuine
            intellectual confrontation.
          </motion.p>

          <motion.div variants={fadeUp} className="flex justify-center gap-3">
            <Link href="/analyze">
              <Button size="lg" className="gap-2 px-6">
                Start Analyzing
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/debate">
              <Button size="lg" variant="outline" className="gap-2 px-6">
                Debate Mode
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Features */}
        <motion.div
          className="mx-auto mt-24 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2"
          initial="initial"
          animate="animate"
          variants={stagger}
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={fadeUp}>
              <BrutalistCard className="p-6">
                <feature.icon className="mb-3 h-5 w-5 text-black" />
                <h3 className="mb-1.5 font-heading text-sm font-bold">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </BrutalistCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Demo claim */}
        <motion.div
          className="mt-24 w-full max-w-2xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <BrutalistCard className="p-1">
            <div className="flex items-center gap-3 bg-white px-4 py-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1 text-sm text-muted-foreground">
                &quot;Large language models will cause mass unemployment within 10
                years&quot;
              </span>
              <Link href="/analyze">
                <Button size="sm" className="gap-1.5">
                  Analyze
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </BrutalistCard>
        </motion.div>
      </div>
    </div>
  );
}
