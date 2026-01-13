import Link from 'next/link';

/**
 * Custom 404 page for the Hosted Truth Page
 * Clean, minimal design matching Silent Luxury aesthetic
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-4">
          <Link
            href="/"
            className="text-xs font-medium text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            Powered by BrandOS
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium mb-4">
            Error 404
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 mb-4">
            Page Not Found
          </h1>
          <p className="text-sm text-zinc-500 mb-8 max-w-sm mx-auto">
            This employer profile does not exist or has not been published yet.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-6 text-center">
          <div className="flex items-center justify-center gap-1">
            <span className="w-1.5 h-1.5 bg-zinc-300 rounded-full" />
            <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium">
              BrandOS
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
