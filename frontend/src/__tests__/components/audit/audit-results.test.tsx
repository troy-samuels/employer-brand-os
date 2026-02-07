import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuditResults } from "@/components/audit/audit-results";
import type { WebsiteCheckResult } from "@/lib/audit/website-checks";

const createMockResult = (
  overrides: Partial<WebsiteCheckResult> = {},
): WebsiteCheckResult => ({
  domain: "example.com",
  companyName: "Example Corp",
  companySlug: "example-corp",
  hasLlmsTxt: false,
  llmsTxtHasEmployment: false,
  hasJsonld: false,
  jsonldSchemasFound: [],
  hasSalaryData: false,
  careersPageStatus: "not_found",
  careersPageUrl: null,
  robotsTxtStatus: "not_found",
  robotsTxtAllowedBots: [],
  robotsTxtBlockedBots: [],
  score: 0,
  scoreBreakdown: {
    llmsTxt: 0,
    jsonld: 0,
    salaryData: 0,
    careersPage: 0,
    robotsTxt: 0,
  },
  ...overrides,
});

describe("AuditResults", () => {
  describe("score display", () => {
    it("should render the results container", () => {
      const result = createMockResult({ score: 45 });
      render(<AuditResults result={result} />);
      expect(screen.getByTestId("audit-results")).toBeInTheDocument();
    });

    it("should display the company name", () => {
      const result = createMockResult({ companyName: "Acme Corp", score: 50 });
      render(<AuditResults result={result} />);
      expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    });

    it("should display /100", () => {
      const result = createMockResult({ score: 75 });
      render(<AuditResults result={result} />);
      expect(screen.getByText("/100")).toBeInTheDocument();
    });
  });

  describe("check cards", () => {
    it("should render all 5 check cards", () => {
      const result = createMockResult();
      render(<AuditResults result={result} />);

      expect(screen.getAllByText("AI Instructions").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Structured Data").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Salary Transparency").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Careers Page").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Bot Access").length).toBeGreaterThanOrEqual(1);
    });

    it("should display score contribution (earned/max)", () => {
      const result = createMockResult({
        scoreBreakdown: {
          llmsTxt: 12,
          jsonld: 25,
          salaryData: 0,
          careersPage: 15,
          robotsTxt: 8,
        },
      });
      render(<AuditResults result={result} />);

      expect(screen.getByText("12/25")).toBeInTheDocument();
      expect(screen.getByText("25/25")).toBeInTheDocument();
      expect(screen.getByText("0/20")).toBeInTheDocument();
      expect(screen.getByText("15/15")).toBeInTheDocument();
      expect(screen.getByText("8/15")).toBeInTheDocument();
    });
  });

  describe("robots.txt details", () => {
    it("should show blocked bots when present", () => {
      const result = createMockResult({
        robotsTxtStatus: "blocks",
        robotsTxtAllowedBots: [],
        robotsTxtBlockedBots: ["GPTBot", "ClaudeBot"],
      });
      render(<AuditResults result={result} />);
      expect(screen.getByText(/AI crawlers are blocked/)).toBeInTheDocument();
      expect(screen.getByText(/GPTBot/)).toBeInTheDocument();
    });

    it("should show allowed status when AI crawlers are allowed", () => {
      const result = createMockResult({
        robotsTxtStatus: "allows",
        robotsTxtAllowedBots: ["GPTBot", "ChatGPT-User", "Google-Extended", "Anthropic", "CCBot"],
        robotsTxtBlockedBots: [],
      });
      render(<AuditResults result={result} />);
      expect(screen.getByText(/All major AI crawlers can access your site/)).toBeInTheDocument();
    });

    it("should show partial status when some bots are allowed and some are blocked", () => {
      const result = createMockResult({
        robotsTxtStatus: "partial",
        robotsTxtAllowedBots: ["GPTBot", "Google-Extended"],
        robotsTxtBlockedBots: ["ChatGPT-User", "Anthropic", "CCBot"],
      });
      render(<AuditResults result={result} />);
      expect(screen.getByText(/Some AI crawlers are blocked/)).toBeInTheDocument();
      expect(screen.getByText(/Allowed: GPTBot, Google-Extended/)).toBeInTheDocument();
    });

    it("should show no rules message when no AI-specific rules found", () => {
      const result = createMockResult({
        robotsTxtStatus: "no_rules",
        robotsTxtAllowedBots: [],
        robotsTxtBlockedBots: [],
      });
      render(<AuditResults result={result} />);
      expect(screen.getByText(/No AI-specific rules in robots.txt/)).toBeInTheDocument();
    });

    it("should show not found message when robots.txt is missing", () => {
      const result = createMockResult({
        robotsTxtStatus: "not_found",
        robotsTxtAllowedBots: [],
        robotsTxtBlockedBots: [],
      });
      render(<AuditResults result={result} />);
      expect(screen.getByText(/No robots.txt found/)).toBeInTheDocument();
    });
  });

  describe("careers page details", () => {
    it("should show careers URL when found", () => {
      const result = createMockResult({
        careersPageStatus: "full",
        careersPageUrl: "https://example.com/careers",
      });
      render(<AuditResults result={result} />);
      expect(screen.getByText(/careers page at https:\/\/example\.com\/careers/)).toBeInTheDocument();
    });

    it("should show partial status when careers page is partial", () => {
      const result = createMockResult({
        careersPageStatus: "partial",
        careersPageUrl: "https://example.com/jobs",
      });
      render(<AuditResults result={result} />);
      expect(screen.getByText(/careers page at https:\/\/example\.com\/jobs/)).toBeInTheDocument();
    });

    it("should show none status when careers page has no content", () => {
      const result = createMockResult({
        careersPageStatus: "none",
        careersPageUrl: null,
      });
      render(<AuditResults result={result} />);
      expect(screen.getByText(/careers page exists but barely/)).toBeInTheDocument();
    });

    it("should show not found message when no careers page exists", () => {
      const result = createMockResult({
        careersPageStatus: "not_found",
        careersPageUrl: null,
      });
      render(<AuditResults result={result} />);
      expect(screen.getByText(/No careers page found/)).toBeInTheDocument();
    });
  });

  describe("JSON-LD schemas", () => {
    it("should list found schemas", () => {
      const result = createMockResult({
        hasJsonld: true,
        jsonldSchemasFound: ["Organization", "JobPosting"],
      });
      render(<AuditResults result={result} />);
      expect(screen.getByText(/Found Organization, JobPosting schema/)).toBeInTheDocument();
    });

    it("should show no schemas message when none found", () => {
      const result = createMockResult({
        hasJsonld: false,
        jsonldSchemasFound: [],
      });
      render(<AuditResults result={result} />);
      expect(screen.getByText(/No structured data on your homepage/)).toBeInTheDocument();
    });
  });

  describe("salary data", () => {
    it("should show positive message when salary data is found", () => {
      const result = createMockResult({
        hasSalaryData: true,
        scoreBreakdown: { llmsTxt: 0, jsonld: 0, salaryData: 20, careersPage: 0, robotsTxt: 0 },
      });
      render(<AuditResults result={result} />);
      expect(screen.getByText(/Salary information is visible to AI crawlers/)).toBeInTheDocument();
    });

    it("should show negative message when no salary data found", () => {
      const result = createMockResult({
        hasSalaryData: false,
        scoreBreakdown: { llmsTxt: 0, jsonld: 0, salaryData: 0, careersPage: 0, robotsTxt: 0 },
      });
      render(<AuditResults result={result} />);
      expect(screen.getByText(/No salary data found/)).toBeInTheDocument();
    });
  });

  describe("llms.txt details", () => {
    it("should show positive message when llms.txt has employment data", () => {
      const result = createMockResult({
        hasLlmsTxt: true,
        llmsTxtHasEmployment: true,
      });
      render(<AuditResults result={result} />);
      expect(screen.getByText(/llms.txt with hiring content/)).toBeInTheDocument();
    });

    it("should show partial message when llms.txt exists but has no employment data", () => {
      const result = createMockResult({
        hasLlmsTxt: true,
        llmsTxtHasEmployment: false,
      });
      render(<AuditResults result={result} />);
      expect(screen.getByText(/llms.txt.*doesn't mention hiring/)).toBeInTheDocument();
    });

    it("should show negative message when llms.txt is missing", () => {
      const result = createMockResult({
        hasLlmsTxt: false,
        llmsTxtHasEmployment: false,
      });
      render(<AuditResults result={result} />);
      expect(screen.getByText(/No llms.txt found/)).toBeInTheDocument();
    });
  });
});
