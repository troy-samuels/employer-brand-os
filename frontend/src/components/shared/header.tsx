import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/shared/navigation";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 lg:px-12 py-4">
        <Link href="/" className="text-lg font-bold text-neutral-950 tracking-tight">
          BrandOS
        </Link>
        <Navigation />
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button variant="primary" size="sm" asChild>
            <Link href="/audit">Free audit</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
