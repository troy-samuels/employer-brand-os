/**
 * @module app/page
 * OpenRole landing page — server component shell with dynamic below-fold sections.
 * Only the hero (audit input) ships as client JS above the fold.
 */

import dynamic from "next/dynamic";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import HeroSection from "@/components/landing/hero-section";

// Below-fold sections — loaded lazily to reduce initial JS bundle
const ProblemStats = dynamic(() => import("@/components/landing/problem-stats"), {
  ssr: true,
});
const Features = dynamic(() => import("@/components/landing/features"), {
  ssr: true,
});
const BeforeAfter = dynamic(() => import("@/components/landing/testimonials"), {
  ssr: true,
});
const PromptIntelligence = dynamic(() => import("@/components/landing/prompt-intelligence"), {
  ssr: true,
});
const MonitorPreview = dynamic(() => import("@/components/landing/monitor-preview"), {
  ssr: true,
});
const EvidenceBar = dynamic(() => import("@/components/landing/evidence-bar"), {
  ssr: true,
});
const Pricing = dynamic(() => import("@/components/landing/pricing"), {
  ssr: true,
});
const CTA = dynamic(() => import("@/components/landing/cta"));

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main>
        <HeroSection />

        {/* ── Below-fold sections (code-split) ────────── */}
        <ProblemStats />
        <Features />
        <BeforeAfter />
        <PromptIntelligence />
        <MonitorPreview />
        <EvidenceBar />
        <Pricing />
        <CTA />
      </main>

      <Footer />
    </div>
  );
}
