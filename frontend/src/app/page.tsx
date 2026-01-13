import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header - Sticky with frosted glass */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <span className="text-xl font-semibold tracking-tight text-foreground">
              BrandOS
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="container mx-auto px-6 py-24 text-center">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-4">
          AI Employer Brand Platform
        </p>
        <h1 className="text-5xl font-semibold tracking-tight text-foreground mb-6">
          Control Your Employer Brand
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Ensure AI agents receive accurate information about your company.
          Stop hallucinations. Start with verified data.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/signup">
            <Button size="lg" className="text-lg px-8 py-6">
              Start Free Trial
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              Sign In
            </Button>
          </Link>
        </div>

        {/* Features - Cards using design system */}
        <div className="grid md:grid-cols-3 gap-6 mt-24 text-left">
          <div className="p-6 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
            <p className="text-[10px] uppercase tracking-widest text-primary font-medium mb-3">
              BrandCore
            </p>
            <h3 className="font-semibold text-lg text-foreground mb-2">Smart Pixel</h3>
            <p className="text-muted-foreground">
              One line of code. Instant JSON-LD schema injection for AI crawlers.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
            <p className="text-[10px] uppercase tracking-widest text-primary font-medium mb-3">
              BrandShield
            </p>
            <h3 className="font-semibold text-lg text-foreground mb-2">Hallucination Radar</h3>
            <p className="text-muted-foreground">
              Monitor what AI says about you. Get alerts on inaccuracies.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
            <p className="text-[10px] uppercase tracking-widest text-primary font-medium mb-3">
              BrandPulse
            </p>
            <h3 className="font-semibold text-lg text-foreground mb-2">Verified Benchmarking</h3>
            <p className="text-muted-foreground">
              Benchmark against verified industry data. Know where you stand.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 border-t border-border">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>© 2025 BrandOS</span>
          <span>The SSL Certificate of Employer Branding</span>
        </div>
      </footer>
    </div>
  );
}
