/**
 * @module middleware
 * Module implementation for middleware.ts.
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { resolveRequestActor } from "@/lib/security/request-metadata";
import { validateCsrf } from "@/lib/utils/csrf";

const publicRoutes = [
  "/",
  "/login",
  "/signup",
  "/auth/callback",
  "/verify",
  "/how-we-score",
  "/demo",
];

const apiPublicRoutes = [
  "/api/health",
  "/api/audit",
  "/api/pixel",
  "/api/jobs",
  "/api/analytics",
];

const mutatingMethods = new Set(["POST", "PUT", "DELETE"]);
const csrfExemptApiRoutes = [
  "/api/monitor/weekly", // Cron/scheduler trigger (server-to-server)
  "/api/pixel/v1/crawl-log", // Authenticated via key + signature
];
const API_LIMIT_PER_MINUTE = 600;
const AUDIT_LIMIT_PER_MINUTE = 200;
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT_CLEANUP_INTERVAL_MS = 15_000;
const MAX_RATE_LIMIT_BUCKETS = 10_000;

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

/**
 * **Serverless caveat:** This in-memory store will NOT share state across
 * serverless invocations. Each cold start gets a fresh map. For
 * production-grade rate limiting on Vercel/Lambda, migrate to Upstash
 * Redis (`@upstash/ratelimit`).
 */
const rateLimitStore = new Map<string, RateLimitBucket>();
let lastRateLimitCleanupAt = 0;

function getRateLimitForPath(pathname: string): number {
  if (pathname === "/api/audit" || pathname.startsWith("/api/audit/")) {
    return AUDIT_LIMIT_PER_MINUTE;
  }

  return API_LIMIT_PER_MINUTE;
}

function isCsrfExempt(pathname: string): boolean {
  return csrfExemptApiRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

function buildRateLimitKey(pathname: string, ip: string): string {
  const scope = pathname === "/api/audit" || pathname.startsWith("/api/audit/")
    ? "audit"
    : "api";

  return `${scope}:${ip}`;
}

function pruneRateLimitStore(now: number): void {
  if (now - lastRateLimitCleanupAt < RATE_LIMIT_CLEANUP_INTERVAL_MS) {
    return;
  }

  lastRateLimitCleanupAt = now;

  for (const [key, bucket] of rateLimitStore.entries()) {
    if (bucket.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }

  if (rateLimitStore.size <= MAX_RATE_LIMIT_BUCKETS) {
    return;
  }

  const entriesByResetAt = Array.from(rateLimitStore.entries()).sort(
    (left, right) => left[1].resetAt - right[1].resetAt,
  );
  const overflow = rateLimitStore.size - MAX_RATE_LIMIT_BUCKETS;

  for (let index = 0; index < overflow; index += 1) {
    const candidate = entriesByResetAt[index];
    if (!candidate) {
      break;
    }
    rateLimitStore.delete(candidate[0]);
  }
}

function checkRateLimit(
  pathname: string,
  ip: string
): {
  allowed: boolean;
  retryAfter: number;
  remaining: number;
  limit: number;
  resetAt: number;
} {
  const now = Date.now();
  const limit = getRateLimitForPath(pathname);
  pruneRateLimitStore(now);

  const key = buildRateLimitKey(pathname, ip);
  const existing = rateLimitStore.get(key);

  const windowResetAt = now + RATE_WINDOW_MS;

  if (!existing || existing.resetAt <= now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: windowResetAt,
    });

    return {
      allowed: true,
      retryAfter: 0,
      remaining: limit - 1,
      limit,
      resetAt: windowResetAt,
    };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      retryAfter: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
      remaining: 0,
      limit,
      resetAt: existing.resetAt,
    };
  }

  existing.count += 1;
  rateLimitStore.set(key, existing);

  return {
    allowed: true,
    retryAfter: 0,
    remaining: Math.max(0, limit - existing.count),
    limit,
    resetAt: existing.resetAt,
  };
}

function createNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  let binary = "";
  for (const value of bytes) {
    binary += String.fromCharCode(value);
  }

  return btoa(binary);
}

function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "worker-src 'self' blob:",
  ].join("; ");
}

function withSecurityHeaders(
  response: NextResponse,
  pathname: string,
  nonce: string
): NextResponse {
  response.headers.set("x-openrole-csp-nonce", nonce);
  response.headers.set("Content-Security-Policy", buildCsp(nonce));
  response.headers.set("X-Permitted-Cross-Domain-Policies", "none");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");

  if (pathname.startsWith("/api/pixel")) {
    response.headers.delete("Cross-Origin-Embedder-Policy");
  } else {
    response.headers.set("Cross-Origin-Embedder-Policy", "require-corp");
  }

  return response;
}

/**
 * Executes middleware.
 * @param request - request input.
 * @returns The resulting value.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApiRoute = pathname.startsWith("/api");
  const isStatic =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".");
  const nonce = createNonce();

  if (isStatic) {
    return withSecurityHeaders(NextResponse.next({ request }), pathname, nonce);
  }

  if (isApiRoute) {
    const ip = resolveRequestActor(request);
    const rateLimitResult = checkRateLimit(pathname, ip);

    if (!rateLimitResult.allowed) {
      const response = NextResponse.json(
        { error: "Rate limit exceeded. Please retry later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimitResult.retryAfter),
            "X-RateLimit-Limit": String(rateLimitResult.limit),
            "X-RateLimit-Remaining": String(rateLimitResult.remaining),
            "X-RateLimit-Reset": String(
              Math.floor(rateLimitResult.resetAt / 1000),
            ),
          },
        }
      );
      return withSecurityHeaders(response, pathname, nonce);
    }

    if (
      mutatingMethods.has(request.method) &&
      !isCsrfExempt(pathname) &&
      !validateCsrf(request)
    ) {
      const response = NextResponse.json(
        { error: "Invalid request origin" },
        { status: 403 }
      );
      return withSecurityHeaders(response, pathname, nonce);
    }
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-openrole-csp-nonce", nonce);

  let supabaseResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublic = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  const isApiPublic = apiPublicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isPublic || isApiPublic) {
    return withSecurityHeaders(supabaseResponse, pathname, nonce);
  }

  if (!user && pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    const response = NextResponse.redirect(url);
    return withSecurityHeaders(response, pathname, nonce);
  }

  return withSecurityHeaders(supabaseResponse, pathname, nonce);
}

/**
 * Exposes exported value(s): config.
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
