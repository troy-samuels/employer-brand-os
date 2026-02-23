/**
 * @module __tests__/lib/audit/input-validation
 * Tests for input validation and sanitization in the audit pipeline.
 * Covers XSS, injection, boundary conditions, and malicious inputs.
 */
import { describe, expect, it } from "vitest";
import { isLikelyDomainOrUrl, validateUrl, isPrivateOrReservedIp } from "@/lib/audit/url-validator";

describe("input-validation", () => {
  describe("isLikelyDomainOrUrl — malicious inputs", () => {
    it("rejects empty string", () => {
      expect(isLikelyDomainOrUrl("")).toBe(false);
    });

    it("rejects whitespace only", () => {
      expect(isLikelyDomainOrUrl("   ")).toBe(false);
    });

    it("rejects plain text without dots", () => {
      expect(isLikelyDomainOrUrl("hello world")).toBe(false);
    });

    it("rejects XSS attempt via script tag", () => {
      expect(isLikelyDomainOrUrl("<script>alert('xss')</script>")).toBe(false);
    });

    it("rejects javascript: protocol", () => {
      expect(isLikelyDomainOrUrl("javascript:alert(1)")).toBe(false);
    });

    it("rejects data: URI", () => {
      expect(isLikelyDomainOrUrl("data:text/html,<h1>Hi</h1>")).toBe(false);
    });

    it("rejects file: protocol", () => {
      expect(isLikelyDomainOrUrl("file:///etc/passwd")).toBe(false);
    });

    it("rejects ftp: protocol", () => {
      expect(isLikelyDomainOrUrl("ftp://files.example.com")).toBe(false);
    });

    it("accepts valid domain with .com", () => {
      expect(isLikelyDomainOrUrl("example.com")).toBe(true);
    });

    it("accepts valid HTTPS URL", () => {
      expect(isLikelyDomainOrUrl("https://example.com")).toBe(true);
    });

    it("accepts valid HTTP URL", () => {
      expect(isLikelyDomainOrUrl("http://example.com")).toBe(true);
    });

    it("accepts domain with subdomain", () => {
      expect(isLikelyDomainOrUrl("www.example.com")).toBe(true);
    });

    it("accepts domain with path", () => {
      expect(isLikelyDomainOrUrl("example.com/careers")).toBe(true);
    });

    it("accepts IP address with http", () => {
      expect(isLikelyDomainOrUrl("http://93.184.216.34")).toBe(true);
    });

    it("accepts localhost (edge case for dev)", () => {
      expect(isLikelyDomainOrUrl("localhost")).toBe(true);
    });

    it("rejects SQL injection attempt", () => {
      // This gets parsed as a domain-like string due to dots
      expect(isLikelyDomainOrUrl("'; DROP TABLE users;--")).toBe(false);
    });

    it("rejects null bytes in URL", () => {
      // URL parser rejects strings containing null bytes
      expect(isLikelyDomainOrUrl("example.com\0/admin")).toBe(false);
    });
  });

  describe("validateUrl — SSRF protection", () => {
    it("blocks localhost", async () => {
      const result = await validateUrl("http://localhost");
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.reason).toBe("blocked_hostname");
      }
    });

    it("blocks localhost.localdomain", async () => {
      const result = await validateUrl("http://localhost.localdomain");
      expect(result.ok).toBe(false);
    });

    it("blocks metadata.google.internal", async () => {
      const result = await validateUrl("http://metadata.google.internal");
      expect(result.ok).toBe(false);
    });

    it("blocks .local domains", async () => {
      const result = await validateUrl("http://myserver.local");
      expect(result.ok).toBe(false);
    });

    it("blocks .localhost subdomains", async () => {
      const result = await validateUrl("http://evil.localhost");
      expect(result.ok).toBe(false);
    });

    it("rejects non-http protocols", async () => {
      const result = await validateUrl("ftp://example.com");
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.reason).toBe("unsupported_protocol");
      }
    });

    it("rejects empty input", async () => {
      const result = await validateUrl("");
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.reason).toBe("invalid_url");
      }
    });
  });

  describe("isPrivateOrReservedIp — comprehensive coverage", () => {
    it("blocks 10.x.x.x range", () => {
      expect(isPrivateOrReservedIp("10.0.0.1")).toBe(true);
      expect(isPrivateOrReservedIp("10.255.255.255")).toBe(true);
    });

    it("blocks 172.16-31.x.x range", () => {
      expect(isPrivateOrReservedIp("172.16.0.1")).toBe(true);
      expect(isPrivateOrReservedIp("172.31.255.255")).toBe(true);
    });

    it("allows 172.32.x.x (not private)", () => {
      expect(isPrivateOrReservedIp("172.32.0.1")).toBe(false);
    });

    it("blocks 192.168.x.x range", () => {
      expect(isPrivateOrReservedIp("192.168.0.1")).toBe(true);
      expect(isPrivateOrReservedIp("192.168.255.255")).toBe(true);
    });

    it("blocks loopback 127.x.x.x", () => {
      expect(isPrivateOrReservedIp("127.0.0.1")).toBe(true);
      expect(isPrivateOrReservedIp("127.255.255.255")).toBe(true);
    });

    it("blocks link-local 169.254.x.x", () => {
      expect(isPrivateOrReservedIp("169.254.0.1")).toBe(true);
      expect(isPrivateOrReservedIp("169.254.169.254")).toBe(true);
    });

    it("allows public IPs", () => {
      expect(isPrivateOrReservedIp("8.8.8.8")).toBe(false);
      expect(isPrivateOrReservedIp("1.1.1.1")).toBe(false);
      expect(isPrivateOrReservedIp("93.184.216.34")).toBe(false);
    });

    it("blocks IPv6 loopback ::1", () => {
      expect(isPrivateOrReservedIp("::1")).toBe(true);
    });

    it("blocks IPv6 unspecified ::", () => {
      expect(isPrivateOrReservedIp("::")).toBe(true);
    });

    it("blocks IPv6 unique local fc00::/7", () => {
      expect(isPrivateOrReservedIp("fc00::1")).toBe(true);
      expect(isPrivateOrReservedIp("fd00::1")).toBe(true);
    });

    it("blocks IPv6 link-local fe80::/10", () => {
      expect(isPrivateOrReservedIp("fe80::1")).toBe(true);
    });

    it("blocks IPv6 documentation prefix 2001:db8::", () => {
      expect(isPrivateOrReservedIp("2001:0db8::1")).toBe(true);
    });

    it("blocks 0.0.0.0/8 range", () => {
      expect(isPrivateOrReservedIp("0.0.0.0")).toBe(true);
      expect(isPrivateOrReservedIp("0.255.255.255")).toBe(true);
    });

    it("blocks multicast 224.0.0.0/4", () => {
      expect(isPrivateOrReservedIp("224.0.0.1")).toBe(true);
    });

    it("blocks reserved 240.0.0.0/4", () => {
      expect(isPrivateOrReservedIp("240.0.0.1")).toBe(true);
    });

    it("blocks carrier-grade NAT 100.64.0.0/10", () => {
      expect(isPrivateOrReservedIp("100.64.0.1")).toBe(true);
    });

    it("blocks benchmark 198.18.0.0/15", () => {
      expect(isPrivateOrReservedIp("198.18.0.1")).toBe(true);
    });

    it("returns true for non-IP strings (treated as unknown/blocked)", () => {
      expect(isPrivateOrReservedIp("not-an-ip")).toBe(true);
    });
  });
});
