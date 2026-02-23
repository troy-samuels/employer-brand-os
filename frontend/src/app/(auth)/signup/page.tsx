/**
 * @module app/(auth)/signup/page
 * Signup page with email/password/company name and Google OAuth.
 * Supports plan selection via ?plan=free|pro|enterprise query param.
 */

"use client";

import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const searchParams = useSearchParams();
  const plan = searchParams?.get("plan") ?? "free"; // free | pro | enterprise
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const supabase = createClient();

  async function handleEmailSignup(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          company_name: companyName.trim() || undefined,
        },
        emailRedirectTo:
          process.env.NEXT_PUBLIC_SUPABASE_REDIRECT_URL ||
          `${window.location.origin}/auth/callback`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setSubmitted(true);
    setLoading(false);
  }

  async function handleGoogleSignup() {
    setLoading(true);
    setError(null);

    const callbackUrl =
      process.env.NEXT_PUBLIC_SUPABASE_REDIRECT_URL ||
      `${window.location.origin}/auth/callback`;

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl,
      },
    });

    if (oauthError) {
      setError(oauthError.message);
      setLoading(false);
    }
  }

  // Enterprise plan → show contact form instead
  if (plan === "enterprise") {
    return (
      <div className="w-full max-w-md mx-auto text-center space-y-6">
        <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
          <svg
            className="h-6 w-6 text-slate-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Enterprise Plan — Let&apos;s talk
        </h2>
        <p className="text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
          Enterprise plans include multi-brand support, API access, custom SLAs, and dedicated CSM. Get in touch and we&apos;ll build a custom package for your needs.
        </p>
        <a
          href="mailto:hello@openrole.co.uk?subject=Enterprise%20plan%20enquiry"
          className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
        >
          Email hello@openrole.co.uk
        </a>
        <p className="text-sm text-slate-400">
          Or{" "}
          <Link href="/signup?plan=compete" className="text-teal-600 hover:text-teal-700 font-medium">
            start with Compete
          </Link>{" "}
          and upgrade later
        </p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="w-full max-w-md mx-auto text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center">
          <svg
            className="h-6 w-6 text-teal-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Check your email
        </h2>
        <p className="text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
          We&apos;ve sent a confirmation link to{" "}
          <span className="font-medium text-slate-700">{email}</span>. Click
          the link to activate your account{plan === "pro" ? " and complete checkout" : ""}.
        </p>
        <p className="text-xs text-slate-400 pt-2">
          Didn&apos;t receive it? Check your spam folder or{" "}
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="text-teal-600 hover:text-teal-700 font-medium"
          >
            try again
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <Link
          href="/"
          className="text-lg font-bold text-slate-900 tracking-tight"
        >
          OpenRole
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Create your account
        </h1>
        <p className="text-sm text-slate-500">
          Start managing your AI employer brand
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Google OAuth */}
      <button
        type="button"
        onClick={handleGoogleSignup}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Sign up with Google
      </button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-gray-50 px-3 text-slate-400">or</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleEmailSignup} className="space-y-4">
        <div>
          <label
            htmlFor="company"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Company name
          </label>
          <input
            id="company"
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Acme Inc."
            autoComplete="organization"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all duration-200"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Work email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
            autoComplete="email"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all duration-200"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all duration-200"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 active:scale-[0.99] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="text-center text-xs text-slate-400 leading-relaxed">
        By creating an account you agree to our{" "}
        <Link href="/terms" className="text-teal-600 hover:text-teal-700">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-teal-600 hover:text-teal-700">
          Privacy Policy
        </Link>
      </p>

      {/* Login link */}
      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-teal-600 hover:text-teal-700 transition-colors duration-200"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
