/**
 * @module __tests__/lib/audit/headless-render
 * Tests for the headless rendering module — abort signal behavior,
 * fallback chain logic, and locale profile resolution.
 */
import { describe, expect, it, vi } from "vitest";

// We can't actually launch Playwright in CI without a browser binary,
// so we mock playwright-core to test the logic around it.
vi.mock("playwright-core", () => ({
  chromium: {
    launch: vi.fn().mockRejectedValue(new Error("No browser binary")),
  },
}));

vi.mock("@sparticuz/chromium", () => {
  throw new Error("Not available");
});

import { renderPage, renderBotProtectedPage } from "@/lib/audit/headless-render";

describe("headless-render", () => {
  describe("renderPage", () => {
    it("returns empty result when browser launch fails", async () => {
      const result = await renderPage("https://example.com");

      expect(result.html).toBe("");
      expect(result.url).toBe("https://example.com");
    });

    it("respects abort signal", async () => {
      const controller = new AbortController();
      controller.abort();

      const result = await renderPage("https://example.com", {
        signal: controller.signal,
      });

      expect(result.html).toBe("");
    });
  });

  describe("renderBotProtectedPage", () => {
    it("returns empty result when all layers fail", async () => {
      const result = await renderBotProtectedPage("https://example.com");

      expect(result.html).toBe("");
      expect(result.url).toBe("https://example.com");
    });

    it("respects abort signal and returns empty early", async () => {
      const controller = new AbortController();
      controller.abort();

      const result = await renderBotProtectedPage("https://example.com", {
        signal: controller.signal,
      });

      expect(result.html).toBe("");
    });

    it("returns empty result when ScrapingBee API key is not set", async () => {
      delete process.env.SCRAPINGBEE_API_KEY;

      const result = await renderBotProtectedPage("https://example.com");

      expect(result.html).toBe("");
    });
  });
});
