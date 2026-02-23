"use client";

import { useState } from "react";
import Link from "next/link";
import { Send, CheckCircle2, Loader2 } from "lucide-react";

export function NominateForm() {
  const [domain, setDomain] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "already" | "error">("idle");
  const [slug, setSlug] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!domain.trim()) return;

    setStatus("loading");

    try {
      const res = await fetch("/api/nominate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: domain.trim(),
          nominatorEmail: email.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (data.status === "already_audited") {
        setStatus("already");
        setSlug(data.slug);
      } else if (data.status === "received") {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex items-center gap-2 text-sm text-teal-600">
        <CheckCircle2 className="h-4 w-4" />
        <span>Nomination received — we&apos;ll audit them soon!</span>
      </div>
    );
  }

  if (status === "already") {
    return (
      <div className="flex items-center gap-2 text-sm text-teal-600">
        <CheckCircle2 className="h-4 w-4" />
        <span>
          Already audited!{" "}
          <Link
            href={`/company/${slug}`}
            className="underline font-medium hover:text-teal-700"
          >
            View their report →
          </Link>
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
      <input
        type="text"
        value={domain}
        onChange={(e) => setDomain(e.target.value)}
        placeholder="company.com"
        className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
        required
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email (optional)"
        className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
      >
        {status === "loading" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Send className="h-3.5 w-3.5" />
        )}
        Nominate
      </button>
      {status === "error" && (
        <span className="text-xs text-red-500 self-center">Something went wrong</span>
      )}
    </form>
  );
}
