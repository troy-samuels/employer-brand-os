import type { NextConfig } from "next";

/**
 * Security headers applied at the config level.
 *
 * NOTE: Content-Security-Policy is NOT set here — it is set exclusively
 * in proxy.ts with a per-request nonce. Setting CSP here would
 * override/compete with the proxy nonce-bearing CSP and break
 * Next.js inline script hydration.
 *
 * Cross-Origin-Embedder-Policy is also omitted for non-API routes
 * because `require-corp` blocks external resources (fonts, images)
 * that lack CORS headers. The proxy sets COEP only where needed.
 */
const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/tools/llms-txt",
        destination: "/tools/employer-schema",
        permanent: true,
      },
      {
        source: "/index/:path*",
        destination: "/uk-index/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes (CSP handled by proxy)
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "X-Permitted-Cross-Domain-Policies",
            value: "none",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
