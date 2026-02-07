import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-6 lg:px-12 py-8 text-sm text-neutral-500">
        <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-semibold text-neutral-950">BrandOS</Link>
            <span>© 2026</span>
          </div>
          <span>Verified employer data for the AI age</span>
        </div>
      </div>
    </footer>
  );
}
