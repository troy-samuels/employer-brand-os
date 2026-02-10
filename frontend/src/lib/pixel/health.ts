/**
 * @module lib/pixel/health
 * Tracks in-process health metrics for pixel API endpoints.
 */

const serviceStartedAtMs = Date.now();
let lastRequestAtIso: string | null = null;

export function markPixelServiceRequest(nowMs: number = Date.now()): void {
  lastRequestAtIso = new Date(nowMs).toISOString();
}

export function getPixelServiceHealth(): {
  uptimeSeconds: number;
  startedAt: string;
  lastRequestAt: string | null;
} {
  const uptimeSeconds = Math.max(
    0,
    Math.floor((Date.now() - serviceStartedAtMs) / 1000)
  );

  return {
    uptimeSeconds,
    startedAt: new Date(serviceStartedAtMs).toISOString(),
    lastRequestAt: lastRequestAtIso,
  };
}
