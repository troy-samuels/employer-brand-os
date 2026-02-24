/**
 * @module __tests__/components/audit/audit-results.test
 * Module implementation for audit-results.test.tsx.
 */

import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { AuditResults } from "@/components/audit/audit-results";
import type { WebsiteCheckResult } from "@/lib/audit/website-checks";

const createMockResult = (
  overrides: Partial<WebsiteCheckResult> = {},
): WebsiteCheckResult => ({
  domain: "example.com",
  companyName: "Example Corp",
  companySlug: "example-corp",
  status: "success",
  hasLlmsTxt: false,
  llmsTxtHasEmployment: false,
  hasJsonld: false,
  jsonldSchemasFound: [],
  hasSalaryData: false,
  salaryConfidence: "none",
  detectedCurrency: null,
  careersPageStatus: "not_found",
  careersPageUrl: null,
  careersBlockedUrl: null,
  atsDetected: null,
  atsProvider: null,
  atsBoardToken: null,
  atsJobCount: null,
  atsAnalysis: null,
  atsGeneratedFacts: null,
  hasSitemap: false,
  robotsTxtStatus: "not_found",
  robotsTxtAllowedBots: [],
  robotsTxtBlockedBots: [],
  brandReputation: {
    platforms: [],
    sentiment: "unknown",
    sourceCount: 0,
    available: true,
  },
  score: 0,
  scoreBreakdown: {
    jsonld: 0,
    robotsTxt: 0,
    careersPage: 0,
    brandReputation: 0,
    salaryData: 0,
    contentFormat: 0,
    llmsTxt: 0,
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
    it("should render all 7 check cards", () => {
      const result = createMockResult();
      render(<AuditResults result={result} />);

      expect(screen.getAllByText(/AI Instructions/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Structured Data").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Salary Transparency").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Careers Page").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("AI Crawler Access").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Content Format").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Brand Presence").length).toBeGreaterThanOrEqual(1);
    });

    it("should display score contribution (earned/max)", () => {
      const result = createMockResult({
        scoreBreakdown: {
          jsonld: 28,
          robotsTxt: 12,
          careersPage: 17,
          brandReputation: 10,
          salaryData: 0,
          contentFormat: 4,
          llmsTxt: 0,
        },
      });
      render(<AuditResults result={result} />);

      expect(screen.getByText("28/28")).toBeInTheDocument();
      expect(screen.getByText("12/17")).toBeInTheDocument();
      expect(screen.getByText("17/17")).toBeInTheDocument();
      expect(screen.getByText("10/17")).toBeInTheDocument();
      expect(screen.getByText("0/12")).toBeInTheDocument();
      expect(screen.getByText("4/9")).toBeInTheDocument();
      // AI Instructions card shows 0/0 (deprecated)
      expect(screen.getByText("0/0")).toBeInTheDocument();
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

  describe("careers URL fallback prompt", () => {
    it("renders careers URL prompt when careersPageStatus is not_found", () => {
      const result = createMockResult({
        careersPageStatus: "not_found",
        careersPageUrl: null,
      });
      render(<AuditResults result={result} />);

      expect(
        screen.getByText(/We couldn't find your careers page\. If it's on a different domain, paste the link below\./),
      ).toBeInTheDocument();
      expect(screen.getByPlaceholderText("e.g. jobs.yourcompany.com/careers")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Re-scan with careers page" })).toBeInTheDocument();
    });

    it("does not render careers URL prompt when careersPageStatus is full", () => {
      const result = createMockResult({
        careersPageStatus: "full",
        careersPageUrl: "https://example.com/careers",
      });
      render(<AuditResults result={result} />);

      expect(
        screen.queryByText(/We couldn't find your careers page\. If it's on a different domain, paste the link below\./),
      ).not.toBeInTheDocument();
    });

    it("accepts URL input and calls onRerunWithCareersUrl on submit", () => {
      const onRerunWithCareersUrl = vi.fn();
      const result = createMockResult({
        careersPageStatus: "not_found",
        careersPageUrl: null,
      });

      render(
        <AuditResults
          result={result}
          onRerunWithCareersUrl={onRerunWithCareersUrl}
          isRerunning={false}
        />,
      );

      fireEvent.change(screen.getByLabelText("Careers page URL"), {
        target: { value: "jobs.example.com/careers" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Re-scan with careers page" }));

      expect(onRerunWithCareersUrl).toHaveBeenCalledTimes(1);
      expect(onRerunWithCareersUrl).toHaveBeenCalledWith("jobs.example.com/careers");
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
        scoreBreakdown: { jsonld: 0, robotsTxt: 0, careersPage: 0, brandReputation: 0, salaryData: 12, contentFormat: 0, llmsTxt: 0 },
      });
      render(<AuditResults result={result} />);
      expect(screen.getByText(/Salary information is visible to AI crawlers/)).toBeInTheDocument();
    });

    it("should show negative message when no salary data found", () => {
      const result = createMockResult({
        hasSalaryData: false,
        scoreBreakdown: { jsonld: 0, robotsTxt: 0, careersPage: 0, brandReputation: 0, salaryData: 0, contentFormat: 0, llmsTxt: 0 },
      });
      render(<AuditResults result={result} />);
      expect(screen.getByText(/No salary data found/)).toBeInTheDocument();
    });
  });

  describe("score contextual summary", () => {
    it("should show urgency message for very low scores (0-20)", () => {
      const result = createMockResult({ score: 10 });
      render(<AuditResults result={result} />);
      expect(screen.getByTestId("score-summary")).toHaveTextContent(
        "AI is guessing about your company. Candidates are getting unreliable answers."
      );
    });

    it("should show gaps message for mid-low scores (21-50)", () => {
      const result = createMockResult({ score: 35 });
      render(<AuditResults result={result} />);
      expect(screen.getByTestId("score-summary")).toHaveTextContent(
        "AI has some data, but gaps mean candidates get incomplete answers."
      );
    });

    it("should show basics message for mid-high scores (51-75)", () => {
      const result = createMockResult({ score: 60 });
      render(<AuditResults result={result} />);
      expect(screen.getByTestId("score-summary")).toHaveTextContent(
        "AI knows the basics, but your full employer story isn't getting through."
      );
    });

    it("should show strong message for high scores (76+)", () => {
      const result = createMockResult({ score: 85 });
      render(<AuditResults result={result} />);
      expect(screen.getByTestId("score-summary")).toHaveTextContent(
        "Your AI presence is strong. Fine-tune it to stay ahead."
      );
    });
  });

  describe("ATS detection in careers detail", () => {
    it("should show ATS-specific message when ATS is detected on partial careers page", () => {
      const result = createMockResult({
        careersPageStatus: "partial",
        careersPageUrl: "https://boards.greenhouse.io/example",
        atsDetected: "Greenhouse",
      });
      render(<AuditResults result={result} />);
      expect(
        screen.getByText(/redirects to an external ATS \(Greenhouse\)/)
      ).toBeInTheDocument();
    });

    it("should show generic partial message when no ATS is detected", () => {
      const result = createMockResult({
        careersPageStatus: "partial",
        careersPageUrl: "https://example.com/jobs",
        atsDetected: null,
      });
      render(<AuditResults result={result} />);
      expect(
        screen.getByText(/careers page at https:\/\/example\.com\/jobs, but it's thin/)
      ).toBeInTheDocument();
    });
  });

  describe("llms.txt deprecation notice", () => {
    it("should show deprecation message explaining llms.txt has zero impact", () => {
      const result = createMockResult({
        hasLlmsTxt: true,
        llmsTxtHasEmployment: true,
      });
      render(<AuditResults result={result} />);
      expect(screen.getByText(/llms.txt has zero impact on AI citations/)).toBeInTheDocument();
    });

    it("should show deprecation message even when llms.txt is missing", () => {
      const result = createMockResult({
        hasLlmsTxt: false,
        llmsTxtHasEmployment: false,
      });
      render(<AuditResults result={result} />);
      expect(screen.getByText(/llms.txt has zero impact on AI citations/)).toBeInTheDocument();
    });
  });
});
