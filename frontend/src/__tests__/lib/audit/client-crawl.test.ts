import { describe, expect, it } from "vitest";
import { analyzeClientSubmittedHtml } from "@/lib/audit/client-crawl";

describe("client-crawl", () => {
  describe("analyzeClientSubmittedHtml", () => {
    it("classifies rich careers page as full with max careers score", () => {
      const html = `<html><body><h1>Careers at Acme</h1><p>${"x".repeat(1200)}</p></body></html>`;
      const result = analyzeClientSubmittedHtml(html, "https://acme.com/careers", "acme.com");

      expect(result.careersPageStatus).toBe("full");
      expect(result.careersPageUrl).toBe("https://acme.com/careers");
      expect(result.scoreUpdates.careersPage).toBe(20);
    });

    it("classifies medium content as partial with 10 point careers score", () => {
      const html = `<html><body><p>${"x".repeat(500)}</p></body></html>`;
      const result = analyzeClientSubmittedHtml(html, "https://acme.com/careers", "acme.com");

      expect(result.careersPageStatus).toBe("partial");
      expect(result.scoreUpdates.careersPage).toBe(10);
    });

    it("classifies very short content as none with 0 careers score", () => {
      const html = `<html><body><p>Hello</p></body></html>`;
      const result = analyzeClientSubmittedHtml(html, "https://acme.com/careers", "acme.com");

      expect(result.careersPageStatus).toBe("none");
      expect(result.scoreUpdates.careersPage).toBe(0);
    });

    it("detects multiple salary ranges with 8-point score", () => {
      // The client-crawl salary detection uses broader regex patterns that can
      // match multiple patterns per range. Two explicit salary range patterns
      // plus "salary range:" prefix gives 3+ matches → multiple_ranges.
      const html = `<html><body>
        <h1>Careers</h1>
        <p>${"x".repeat(1200)}</p>
        <p>Software Engineer: £50,000-£70,000 per annum</p>
        <p>Product Manager: salary range: £60,000-£80,000</p>
      </body></html>`;
      const result = analyzeClientSubmittedHtml(html, "https://acme.com/careers", "acme.com");

      expect(result.hasSalaryData).toBe(true);
      expect(result.salaryConfidence).toBe("multiple_ranges");
      expect(result.scoreUpdates.salaryData).toBe(8);
    });

    it("detects single salary range with 5-point score", () => {
      // Only one salary regex should match here (salary: £X pattern)
      const html = `<html><body>
        <h1>Careers</h1>
        <p>${"x".repeat(1200)}</p>
        <p>salary: £50,000</p>
      </body></html>`;
      const result = analyzeClientSubmittedHtml(html, "https://acme.com/careers", "acme.com");

      expect(result.hasSalaryData).toBe(true);
      expect(result.salaryConfidence).toBe("single_range");
      expect(result.scoreUpdates.salaryData).toBe(5);
    });

    it("detects salary mention only with 2-point score", () => {
      const html = `<html><body>
        <h1>Careers</h1>
        <p>${"x".repeat(1200)}</p>
        <p>We offer a competitive salary package to all employees.</p>
      </body></html>`;
      const result = analyzeClientSubmittedHtml(html, "https://acme.com/careers", "acme.com");

      expect(result.hasSalaryData).toBe(true);
      expect(result.salaryConfidence).toBe("mention_only");
      expect(result.scoreUpdates.salaryData).toBe(2);
    });

    it("returns 0 salary score when no salary data present", () => {
      const html = `<html><body><h1>About Us</h1><p>${"x".repeat(1200)}</p></body></html>`;
      const result = analyzeClientSubmittedHtml(html, "https://acme.com/about", "acme.com");

      expect(result.hasSalaryData).toBe(false);
      expect(result.salaryConfidence).toBe("none");
      expect(result.scoreUpdates.salaryData).toBe(0);
    });

    it("detects JobPosting JSON-LD with max 20-point schema score", () => {
      const html = `<html><body>
        <h1>Careers</h1>
        <p>${"x".repeat(1200)}</p>
        <script type="application/ld+json">{"@type":"JobPosting","title":"Engineer"}</script>
      </body></html>`;
      const result = analyzeClientSubmittedHtml(html, "https://acme.com/careers", "acme.com");

      expect(result.hasJsonld).toBe(true);
      expect(result.jsonldSchemasFound).toContain("JobPosting");
      expect(result.scoreUpdates.jsonld).toBe(20);
    });

    it("detects Organization JSON-LD with 12-point schema score", () => {
      const html = `<html><body>
        <script type="application/ld+json">{"@type":"Organization","name":"Acme"}</script>
      </body></html>`;
      const result = analyzeClientSubmittedHtml(html, "https://acme.com", "acme.com");

      expect(result.jsonldSchemasFound).toContain("Organization");
      expect(result.scoreUpdates.jsonld).toBe(12);
    });

    it("detects generic JSON-LD with 5-point schema score", () => {
      const html = `<html><body>
        <script type="application/ld+json">{"@type":"WebSite","name":"Acme"}</script>
      </body></html>`;
      const result = analyzeClientSubmittedHtml(html, "https://acme.com", "acme.com");

      expect(result.hasJsonld).toBe(true);
      expect(result.scoreUpdates.jsonld).toBe(5);
    });

    it("returns 0 schema score when no JSON-LD present", () => {
      const html = `<html><body><p>${"x".repeat(1200)}</p></body></html>`;
      const result = analyzeClientSubmittedHtml(html, "https://acme.com", "acme.com");

      expect(result.hasJsonld).toBe(false);
      expect(result.scoreUpdates.jsonld).toBe(0);
    });

    it("handles empty HTML gracefully", () => {
      const result = analyzeClientSubmittedHtml("", "https://acme.com", "acme.com");

      expect(result.careersPageStatus).toBe("none");
      expect(result.hasSalaryData).toBe(false);
      expect(result.hasJsonld).toBe(false);
      expect(result.scoreUpdates.careersPage).toBe(0);
      expect(result.scoreUpdates.salaryData).toBe(0);
      expect(result.scoreUpdates.jsonld).toBe(0);
    });

    it("falls back to domain-based URL when URL is empty", () => {
      const html = `<html><body><p>${"x".repeat(1200)}</p></body></html>`;
      const result = analyzeClientSubmittedHtml(html, "", "acme.com");

      expect(result.careersPageUrl).toBe("https://acme.com");
    });

    it("handles malformed JSON-LD gracefully", () => {
      const html = `<html><body>
        <script type="application/ld+json">not valid json</script>
        <p>${"x".repeat(1200)}</p>
      </body></html>`;
      const result = analyzeClientSubmittedHtml(html, "https://acme.com", "acme.com");

      expect(result.hasJsonld).toBe(false);
      expect(result.scoreUpdates.jsonld).toBe(0);
    });

    it("detects multiple currencies correctly", () => {
      const html = `<html><body>
        <p>${"x".repeat(1200)}</p>
        <p>Salary: £50,000 per annum</p>
      </body></html>`;
      const result = analyzeClientSubmittedHtml(html, "https://acme.com/careers", "acme.com");

      expect(result.detectedCurrency).toBe("GBP");
    });

    it("handles nested JSON-LD arrays", () => {
      const html = `<html><body>
        <script type="application/ld+json">[{"@type":"JobPosting"},{"@type":"Organization"}]</script>
      </body></html>`;
      const result = analyzeClientSubmittedHtml(html, "https://acme.com", "acme.com");

      expect(result.jsonldSchemasFound).toContain("JobPosting");
      expect(result.jsonldSchemasFound).toContain("Organization");
      expect(result.scoreUpdates.jsonld).toBe(20);
    });
  });
});
