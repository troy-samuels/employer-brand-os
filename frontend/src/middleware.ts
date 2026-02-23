/**
 * @module middleware
 * Next.js middleware entry point.
 * Re-exports the proxy which handles auth, rate limiting, CSRF, and security headers.
 */

export { proxy as middleware, config } from "@/proxy";
