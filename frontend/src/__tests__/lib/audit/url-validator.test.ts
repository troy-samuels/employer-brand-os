/**
 * @module __tests__/lib/audit/url-validator.test
 * Module implementation for url-validator.test.ts.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import { isPrivateOrReservedIp, validateUrl } from "@/lib/audit/url-validator";
import * as dns from "node:dns/promises";

vi.mock("node:dns/promises", () => ({
  lookup: vi.fn(),
}));

describe("url-validator", () => {
  beforeEach(() => {
    vi.mocked(dns.lookup).mockReset();
  });

  describe("isPrivateOrReservedIp", () => {
    it("blocks private and loopback IPv4 ranges", () => {
      expect(isPrivateOrReservedIp("127.0.0.1")).toBe(true);
      expect(isPrivateOrReservedIp("10.0.0.10")).toBe(true);
      expect(isPrivateOrReservedIp("172.16.2.1")).toBe(true);
      expect(isPrivateOrReservedIp("192.168.1.20")).toBe(true);
      expect(isPrivateOrReservedIp("169.254.169.254")).toBe(true);
    });

    it("blocks private and loopback IPv6 ranges", () => {
      expect(isPrivateOrReservedIp("::1")).toBe(true);
      expect(isPrivateOrReservedIp("fc00::1")).toBe(true);
      expect(isPrivateOrReservedIp("fe80::1")).toBe(true);
    });

    it("allows public IPv4 addresses", () => {
      expect(isPrivateOrReservedIp("93.184.216.34")).toBe(false);
    });
  });

  describe("validateUrl", () => {
    it("rejects non-http(s) schemes", async () => {
      await expect(validateUrl("ftp://example.com")).resolves.toEqual({
        ok: false,
        reason: "unsupported_protocol",
      });
      await expect(validateUrl("file:///etc/passwd")).resolves.toEqual({
        ok: false,
        reason: "unsupported_protocol",
      });
    });

    it("rejects localhost hostnames before DNS lookup", async () => {
      await expect(validateUrl("http://localhost:3000")).resolves.toEqual({
        ok: false,
        reason: "blocked_hostname",
      });
      expect(dns.lookup).not.toHaveBeenCalled();
    });

    it("rejects hostnames that resolve to private IPs", async () => {
      vi.mocked(dns.lookup).mockImplementationOnce(
        async () => [{ address: "10.0.0.42", family: 4 }] as never,
      );

      await expect(validateUrl("https://example.com")).resolves.toEqual({
        ok: false,
        reason: "private_network",
      });
    });

    it("accepts public hostnames", async () => {
      vi.mocked(dns.lookup).mockImplementationOnce(
        async () => [{ address: "93.184.216.34", family: 4 }] as never,
      );

      const result = await validateUrl("public-example.com");
      expect(result.ok).toBe(true);
    });
  });
});
