/**
 * @module lib/ats/detect
 * Detect which Applicant Tracking System (ATS) a company uses from their careers page.
 * Supports: Greenhouse, Lever, Ashby, Workable, Teamtailor, SmartRecruiters, BambooHR.
 */

const FETCH_TIMEOUT_MS = 8000;
const USER_AGENT = "OpenRoleAuditBot/1.1 (+https://openrole.ai/audit)";

/**
 * ATS provider configurations with URL patterns and HTML signatures
 */
const ATS_PROVIDERS = {
  greenhouse: {
    name: "Greenhouse",
    urlPatterns: [
      /boards\.greenhouse\.io\/([^\/]+)/i,
      /boards-api\.greenhouse\.io/i,
    ],
    htmlPatterns: [
      /greenhouse/i,
      /gh-jobboard/i,
      /boards\.greenhouse\.io/i,
    ],
    extractToken: (url: string, html: string): string | null => {
      // Try URL first
      const urlMatch = url.match(/boards\.greenhouse\.io\/([^\/\?]+)/i);
      if (urlMatch?.[1]) return urlMatch[1];
      
      // Try HTML - look for board token in script tags
      const scriptMatch = html.match(/boards\.greenhouse\.io\/([^\/\?"']+)/i);
      if (scriptMatch?.[1]) return scriptMatch[1];
      
      return null;
    },
  },
  lever: {
    name: "Lever",
    urlPatterns: [
      /jobs\.lever\.co\/([^\/]+)/i,
      /api\.lever\.co/i,
    ],
    htmlPatterns: [
      /lever\.co/i,
      /lever-framework/i,
      /postings\.lever\.co/i,
    ],
    extractToken: (url: string, html: string): string | null => {
      // Try URL first
      const urlMatch = url.match(/jobs\.lever\.co\/([^\/\?]+)/i);
      if (urlMatch?.[1]) return urlMatch[1];
      
      // Try HTML - look for company slug in script tags
      const scriptMatch = html.match(/jobs\.lever\.co\/([^\/\?"']+)/i);
      if (scriptMatch?.[1]) return scriptMatch[1];
      
      return null;
    },
  },
  ashby: {
    name: "Ashby",
    urlPatterns: [
      /jobs\.ashbyhq\.com\/([^\/]+)/i,
    ],
    htmlPatterns: [
      /ashbyhq\.com/i,
      /ashby-embed/i,
    ],
    extractToken: (url: string, html: string): string | null => {
      // Try URL first
      const urlMatch = url.match(/jobs\.ashbyhq\.com\/([^\/\?]+)/i);
      if (urlMatch?.[1]) return urlMatch[1];
      
      // Try HTML - look for organization slug
      const scriptMatch = html.match(/jobs\.ashbyhq\.com\/([^\/\?"']+)/i);
      if (scriptMatch?.[1]) return scriptMatch[1];
      
      return null;
    },
  },
  workable: {
    name: "Workable",
    urlPatterns: [
      /apply\.workable\.com\/([^\/]+)/i,
      /([^\/]+)\.workable\.com/i,
    ],
    htmlPatterns: [
      /workable\.com/i,
      /whr-embed/i,
    ],
    extractToken: (url: string, html: string): string | null => {
      // Try URL patterns
      const applyMatch = url.match(/apply\.workable\.com\/([^\/\?]+)/i);
      if (applyMatch?.[1]) return applyMatch[1];
      
      const subdomainMatch = url.match(/([^\/]+)\.workable\.com/i);
      if (subdomainMatch?.[1] && subdomainMatch[1] !== "apply") {
        return subdomainMatch[1];
      }
      
      // Try HTML
      const scriptMatch = html.match(/apply\.workable\.com\/([^\/\?"']+)/i);
      if (scriptMatch?.[1]) return scriptMatch[1];
      
      return null;
    },
  },
  teamtailor: {
    name: "Teamtailor",
    urlPatterns: [
      /career\.teamtailor\.com\/([^\/]+)/i,
    ],
    htmlPatterns: [
      /teamtailor\.com/i,
      /teamtailor-embed/i,
    ],
    extractToken: (url: string, html: string): string | null => {
      // Try URL first
      const urlMatch = url.match(/career\.teamtailor\.com\/([^\/\?]+)/i);
      if (urlMatch?.[1]) return urlMatch[1];
      
      // Try HTML
      const scriptMatch = html.match(/career\.teamtailor\.com\/([^\/\?"']+)/i);
      if (scriptMatch?.[1]) return scriptMatch[1];
      
      return null;
    },
  },
  smartrecruiters: {
    name: "SmartRecruiters",
    urlPatterns: [
      /jobs\.smartrecruiters\.com\/([^\/]+)/i,
    ],
    htmlPatterns: [
      /smartrecruiters\.com/i,
      /sr-widget/i,
    ],
    extractToken: (url: string, html: string): string | null => {
      // Try URL first
      const urlMatch = url.match(/jobs\.smartrecruiters\.com\/([^\/\?]+)/i);
      if (urlMatch?.[1]) return urlMatch[1];
      
      // Try HTML
      const scriptMatch = html.match(/jobs\.smartrecruiters\.com\/([^\/\?"']+)/i);
      if (scriptMatch?.[1]) return scriptMatch[1];
      
      return null;
    },
  },
  bamboohr: {
    name: "BambooHR",
    urlPatterns: [
      /([^\/]+)\.bamboohr\.com\/jobs/i,
    ],
    htmlPatterns: [
      /bamboohr\.com/i,
      /BambooHR/i,
    ],
    extractToken: (url: string, html: string): string | null => {
      // Try URL first
      const urlMatch = url.match(/([^\/]+)\.bamboohr\.com\/jobs/i);
      if (urlMatch?.[1]) return urlMatch[1];
      
      // Try HTML
      const scriptMatch = html.match(/([^\/]+)\.bamboohr\.com\/jobs/i);
      if (scriptMatch?.[1]) return scriptMatch[1];
      
      return null;
    },
  },
} as const;

export type ATSProvider = keyof typeof ATS_PROVIDERS;

export interface ATSDetectionResult {
  provider: ATSProvider | null;
  boardToken: string | null;
  confidence: number;
}

/**
 * Fetch a URL with timeout and proper headers
 */
async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
      },
      redirect: "follow",
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Detect ATS provider from a careers page URL
 * 
 * @param careersPageUrl - The company's careers page URL
 * @returns Detection result with provider, board token, and confidence score
 * 
 * @example
 * ```typescript
 * const result = await detectATS("https://monzo.com/careers");
 * if (result.provider === "greenhouse") {
 *   console.log(`Board token: ${result.boardToken}`);
 * }
 * ```
 */
export async function detectATS(careersPageUrl: string): Promise<ATSDetectionResult> {
  try {
    // Normalize URL
    const url = careersPageUrl.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return { provider: null, boardToken: null, confidence: 0 };
    }

    // Check URL patterns first (highest confidence)
    for (const [key, config] of Object.entries(ATS_PROVIDERS)) {
      const provider = key as ATSProvider;
      for (const pattern of config.urlPatterns) {
        if (pattern.test(url)) {
          const token = config.extractToken(url, "");
          return {
            provider,
            boardToken: token,
            confidence: token ? 1.0 : 0.9,
          };
        }
      }
    }

    // Fetch HTML content for deeper inspection
    let html = "";
    let finalUrl = url;
    
    try {
      const response = await fetchWithTimeout(url);
      if (!response.ok) {
        return { provider: null, boardToken: null, confidence: 0 };
      }
      
      html = await response.text();
      finalUrl = response.url; // Get final URL after redirects
      
      // Check final URL against patterns (in case of redirects)
      for (const [key, config] of Object.entries(ATS_PROVIDERS)) {
        const provider = key as ATSProvider;
        for (const pattern of config.urlPatterns) {
          if (pattern.test(finalUrl)) {
            const token = config.extractToken(finalUrl, html);
            return {
              provider,
              boardToken: token,
              confidence: token ? 0.95 : 0.85,
            };
          }
        }
      }
    } catch (error) {
      // Network error - can't fetch HTML, return no detection
      console.error(`[ATS Detection] Failed to fetch ${url}:`, error);
      return { provider: null, boardToken: null, confidence: 0 };
    }

    // Check HTML patterns (lower confidence)
    const matches: Array<{ provider: ATSProvider; count: number; token: string | null }> = [];
    
    for (const [key, config] of Object.entries(ATS_PROVIDERS)) {
      const provider = key as ATSProvider;
      let matchCount = 0;
      
      for (const pattern of config.htmlPatterns) {
        if (pattern.test(html)) {
          matchCount++;
        }
      }
      
      if (matchCount > 0) {
        const token = config.extractToken(finalUrl, html);
        matches.push({ provider, count: matchCount, token });
      }
    }

    // Return best match if found
    if (matches.length > 0) {
      // Sort by match count, prefer matches with tokens
      matches.sort((a, b) => {
        if (a.token && !b.token) return -1;
        if (!a.token && b.token) return 1;
        return b.count - a.count;
      });
      
      const best = matches[0];
      const confidence = best.token 
        ? Math.min(0.8, 0.5 + (best.count * 0.1))
        : Math.min(0.7, 0.4 + (best.count * 0.1));
      
      return {
        provider: best.provider,
        boardToken: best.token,
        confidence,
      };
    }

    // No ATS detected
    return { provider: null, boardToken: null, confidence: 0 };
    
  } catch (error) {
    console.error("[ATS Detection] Error:", error);
    return { provider: null, boardToken: null, confidence: 0 };
  }
}

/**
 * Check if a detected ATS result is reliable enough to use
 * @param result - The detection result
 * @param minConfidence - Minimum confidence threshold (default: 0.6)
 */
export function isReliableDetection(
  result: ATSDetectionResult,
  minConfidence = 0.6
): boolean {
  return result.provider !== null && result.confidence >= minConfidence;
}
