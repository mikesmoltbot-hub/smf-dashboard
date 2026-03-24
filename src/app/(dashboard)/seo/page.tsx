"use client";

import { motion } from "framer-motion";
import { Search, Sparkles, TrendingUp, FileText, ArrowRight } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Traditional SEO",
    description: "Meta tags, headers, keywords, and site structure optimization",
  },
  {
    icon: Sparkles,
    title: "GEO Optimization",
    description: "Optimize for AI search engines (ChatGPT, Perplexity, Gemini, Claude)",
  },
  {
    icon: TrendingUp,
    title: "Performance Tracking",
    description: "Monitor rankings and AI citation rates over time",
  },
  {
    icon: FileText,
    title: "Content Analysis",
    description: "Real-time content scoring for SEO and GEO fit",
  },
];

export default function SEOPage() {
  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--smf-primary)]/10">
              <Search className="h-5 w-5 text-[var(--smf-primary)]" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">SEO + GEO</h1>
            <span className="rounded-full bg-[var(--smf-pro)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--smf-pro)]">
              PRO
            </span>
          </div>
          <p className="text-[var(--text-muted)]">
            Optimize your content for both traditional search engines and AI platforms.
          </p>
        </div>

        {/* Coming Soon */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--smf-primary)]/10">
            <Search className="h-8 w-8 text-[var(--smf-primary)]" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-[var(--text-primary)]">
            Coming Soon
          </h2>
          <p className="mx-auto mb-8 max-w-md text-[var(--text-muted)]">
            SEO + GEO is currently under development. Get ahead of the competition by preparing your content for AI-powered search.
          </p>

          {/* Feature Preview */}
          <div className="grid gap-4 md:grid-cols-2">
            {features.map((feature, i) => (
              <div
                key={i}
                className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-4 text-left"
              >
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--smf-primary)]/10">
                  <feature.icon className="h-4 w-4 text-[var(--smf-primary)]" />
                </div>
                <h3 className="mb-1 font-medium text-[var(--text-primary)]">{feature.title}</h3>
                <p className="text-sm text-[var(--text-muted)]">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-8 flex justify-center gap-4">
            <button className="flex items-center gap-2 rounded-lg bg-[var(--smf-primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--smf-primary)]/90">
              <Sparkles className="h-4 w-4" />
              Join Waitlist
            </button>
            <button className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--smf-primary)]">
              Learn About GEO
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
