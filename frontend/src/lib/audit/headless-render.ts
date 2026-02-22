/**
 * @module lib/audit/headless-render
 * Headless browser rendering with stealth fallback and ScrapingBee backup.
 *
 * Layer 1: Basic Chromium render (fast, for JS-rendered SPAs)
 * Layer 2: Stealth Chromium render (passes most Cloudflare/bot challenges)
 * Layer 3: ScrapingBee API (residential proxies, passes everything)
 */

import { chromium as playwrightChromium } from "playwright-core";

/* ── Timeouts ────────────────────────────────────── */

const RENDER_TIMEOUT_MS = 8_000;
const STEALTH_TIMEOUT_MS = 15_000;
const STEALTH_CHALLENGE_WAIT_MS = 8_000;
const SCRAPINGBEE_TIMEOUT_MS = 20_000;

/* ── Stealth configuration ───────────────────────── */

const STEALTH_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const STEALTH_VIEWPORT = { width: 1440, height: 900 };

type RenderLocaleProfile = {
  chromiumLangArg: string;
  acceptLanguage: string;
  locale: string;
  timezoneId: string;
  scrapingBeeCountry: string;
  navigatorLanguages: string[];
};

function getRenderLocaleProfile(url: string): RenderLocaleProfile {
  let hostname = "";
  try {
    hostname = new URL(url).hostname.toLowerCase();
  } catch {
    hostname = "";
  }

  const profiles: Array<{ suffixes: string[]; profile: RenderLocaleProfile }> = [
    {
      suffixes: [".co.uk", ".uk"],
      profile: {
        chromiumLangArg: "en-GB,en",
        acceptLanguage: "en-GB,en;q=0.9",
        locale: "en-GB",
        timezoneId: "Europe/London",
        scrapingBeeCountry: "gb",
        navigatorLanguages: ["en-GB", "en"],
      },
    },
    {
      suffixes: [".de"],
      profile: {
        chromiumLangArg: "de-DE,de,en",
        acceptLanguage: "de-DE,de;q=0.9,en;q=0.8",
        locale: "de-DE",
        timezoneId: "Europe/Berlin",
        scrapingBeeCountry: "de",
        navigatorLanguages: ["de-DE", "de", "en"],
      },
    },
    {
      suffixes: [".fr"],
      profile: {
        chromiumLangArg: "fr-FR,fr,en",
        acceptLanguage: "fr-FR,fr;q=0.9,en;q=0.8",
        locale: "fr-FR",
        timezoneId: "Europe/Paris",
        scrapingBeeCountry: "fr",
        navigatorLanguages: ["fr-FR", "fr", "en"],
      },
    },
    {
      suffixes: [".co.jp", ".jp"],
      profile: {
        chromiumLangArg: "ja-JP,ja,en",
        acceptLanguage: "ja-JP,ja;q=0.9,en;q=0.7",
        locale: "ja-JP",
        timezoneId: "Asia/Tokyo",
        scrapingBeeCountry: "jp",
        navigatorLanguages: ["ja-JP", "ja", "en"],
      },
    },
    {
      suffixes: [".kr"],
      profile: {
        chromiumLangArg: "ko-KR,ko,en",
        acceptLanguage: "ko-KR,ko;q=0.9,en;q=0.7",
        locale: "ko-KR",
        timezoneId: "Asia/Seoul",
        scrapingBeeCountry: "kr",
        navigatorLanguages: ["ko-KR", "ko", "en"],
      },
    },
    {
      suffixes: [".cn"],
      profile: {
        chromiumLangArg: "zh-CN,zh,en",
        acceptLanguage: "zh-CN,zh;q=0.9,en;q=0.6",
        locale: "zh-CN",
        timezoneId: "Asia/Shanghai",
        scrapingBeeCountry: "cn",
        navigatorLanguages: ["zh-CN", "zh", "en"],
      },
    },
    {
      suffixes: [".in"],
      profile: {
        chromiumLangArg: "en-IN,en",
        acceptLanguage: "en-IN,en;q=0.9",
        locale: "en-IN",
        timezoneId: "Asia/Kolkata",
        scrapingBeeCountry: "in",
        navigatorLanguages: ["en-IN", "en"],
      },
    },
    {
      suffixes: [".com.au", ".au"],
      profile: {
        chromiumLangArg: "en-AU,en",
        acceptLanguage: "en-AU,en;q=0.9",
        locale: "en-AU",
        timezoneId: "Australia/Sydney",
        scrapingBeeCountry: "au",
        navigatorLanguages: ["en-AU", "en"],
      },
    },
    {
      suffixes: [".ca"],
      profile: {
        chromiumLangArg: "en-CA,en",
        acceptLanguage: "en-CA,en;q=0.9",
        locale: "en-CA",
        timezoneId: "America/Toronto",
        scrapingBeeCountry: "ca",
        navigatorLanguages: ["en-CA", "en"],
      },
    },
  ];

  for (const entry of profiles) {
    if (entry.suffixes.some((suffix) => hostname.endsWith(suffix))) {
      return entry.profile;
    }
  }

  return {
    chromiumLangArg: "en-US,en",
    acceptLanguage: "en-US,en;q=0.9",
    locale: "en-US",
    timezoneId: "America/New_York",
    scrapingBeeCountry: "us",
    navigatorLanguages: ["en-US", "en"],
  };
}

/* ── Browser executable resolution ───────────────── */

async function getChromiumOptions(): Promise<{
  executablePath: string | undefined;
  args: string[];
}> {
  // In serverless (Vercel/Lambda), use @sparticuz/chromium
  try {
    const chromium = await import("@sparticuz/chromium");
    const executablePath = await chromium.default.executablePath();

    // Verify it's actually executable (won't work on macOS dev)
    const { accessSync, constants } = await import("node:fs");
    const { execFileSync } = await import("node:child_process");
    accessSync(executablePath, constants.X_OK);
    // Quick sanity check — if this throws, fall through to system Chrome
    execFileSync(executablePath, ["--version"], { timeout: 3000 });

    return {
      executablePath,
      args: chromium.default.args,
    };
  } catch {
    // Not serverless or binary not executable — use Playwright's bundled Chromium
    return {
      executablePath: undefined, // Playwright finds its own
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--no-first-run",
        "--no-zygote",
        "--single-process",
        "--hide-scrollbars",
        "--mute-audio",
      ],
    };
  }
}

/* ── Abort-signal helpers ────────────────────────── */

/** Options bag for render functions that accept an external abort signal. */
export interface RenderOptions {
  /** If provided, the render will abort when this signal fires. */
  signal?: AbortSignal;
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw new Error("Render aborted by caller");
}

/* ── Helpers ─────────────────────────────────────── */

type RenderResult = { html: string; url: string };

const EMPTY_RESULT = (url: string): RenderResult => ({ html: "", url });

function isChallengePage(html: string): boolean {
  return (
    html.includes("challenge-platform") ||
    html.includes("cf-challenge") ||
    html.includes("Just a moment...") ||
    html.includes("Checking your browser") ||
    html.includes("Attention Required")
  );
}

/* ── Layer 1: Basic render ───────────────────────── */

export async function renderPage(
  url: string,
  { signal }: RenderOptions = {},
): Promise<RenderResult> {
  let browser: Awaited<ReturnType<typeof playwrightChromium.launch>> | null = null;

  try {
    throwIfAborted(signal);

    const opts = await getChromiumOptions();
    browser = await playwrightChromium.launch({
      args: opts.args,
      executablePath: opts.executablePath,
      headless: true,
    });

    throwIfAborted(signal);

    const page = await browser.newPage();

    try {
      await page.goto(url, {
        waitUntil: "networkidle",
        timeout: RENDER_TIMEOUT_MS,
      });
    } catch {
      // Best effort: continue with whatever the page rendered before timeout/error.
    }

    throwIfAborted(signal);

    const html = await page.content();
    const finalUrl = page.url();

    return {
      html,
      url: finalUrl && finalUrl !== "about:blank" ? finalUrl : url,
    };
  } catch {
    return EMPTY_RESULT(url);
  } finally {
    if (browser) {
      await browser.close().catch(() => undefined);
    }
  }
}

/* ── Layer 2: Stealth render ─────────────────────── */

export async function renderPageStealth(
  url: string,
  { signal }: RenderOptions = {},
): Promise<RenderResult> {
  let browser: Awaited<ReturnType<typeof playwrightChromium.launch>> | null = null;

  try {
    throwIfAborted(signal);

    const localeProfile = getRenderLocaleProfile(url);
    const opts = await getChromiumOptions();
    const stealthArgs = [
      ...opts.args,
      "--disable-blink-features=AutomationControlled",
      "--disable-features=IsolateOrigins,site-per-process",
      "--disable-site-isolation-trials",
      `--lang=${localeProfile.chromiumLangArg}`,
    ];

    browser = await playwrightChromium.launch({
      args: stealthArgs,
      executablePath: opts.executablePath,
      headless: true,
    });

    const context = await browser.newContext({
      userAgent: STEALTH_USER_AGENT,
      viewport: STEALTH_VIEWPORT,
      locale: localeProfile.locale,
      timezoneId: localeProfile.timezoneId,
      deviceScaleFactor: 2,
      hasTouch: false,
      javaScriptEnabled: true,
      bypassCSP: true,
      extraHTTPHeaders: {
        "Accept-Language": localeProfile.acceptLanguage,
        "Accept":
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Sec-CH-UA": '"Chromium";v="131", "Not_A Brand";v="24"',
        "Sec-CH-UA-Mobile": "?0",
        "Sec-CH-UA-Platform": '"macOS"',
        "Upgrade-Insecure-Requests": "1",
      },
    });

    throwIfAborted(signal);

    const page = await context.newPage();

    // Override navigator.webdriver to hide automation
    await page.addInitScript((navigatorLanguages: string[]) => {
      Object.defineProperty(navigator, "webdriver", { get: () => false });
      Object.defineProperty(navigator, "plugins", {
        get: () => [1, 2, 3, 4, 5],
      });
      Object.defineProperty(navigator, "languages", {
        get: () => navigatorLanguages,
      });
    }, localeProfile.navigatorLanguages);

    try {
      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: STEALTH_TIMEOUT_MS,
      });
    } catch {
      // Best effort
    }

    // Check if we hit a Cloudflare challenge page — wait for it to resolve
    let html = await page.content();
    if (isChallengePage(html)) {
      try {
        // Wait for Cloudflare challenge to auto-solve (typically 3-5 seconds)
        await page.waitForNavigation({
          waitUntil: "networkidle",
          timeout: STEALTH_CHALLENGE_WAIT_MS,
        });
      } catch {
        // Challenge didn't resolve — we'll return whatever we have
      }
      html = await page.content();
    } else {
      // Not a challenge page — wait for full network idle
      try {
        await page.waitForLoadState("networkidle", {
          timeout: STEALTH_TIMEOUT_MS,
        });
      } catch {
        // Timeout is fine — use what we have
      }
      html = await page.content();
    }

    throwIfAborted(signal);

    const finalUrl = page.url();

    // If we still got a challenge page, return empty (let ScrapingBee handle it)
    if (isChallengePage(html)) {
      return EMPTY_RESULT(url);
    }

    return {
      html,
      url: finalUrl && finalUrl !== "about:blank" ? finalUrl : url,
    };
  } catch {
    return EMPTY_RESULT(url);
  } finally {
    if (browser) {
      await browser.close().catch(() => undefined);
    }
  }
}

/* ── Layer 3: ScrapingBee ────────────────────────── */

export async function renderPageScrapingBee(
  url: string,
  { signal }: RenderOptions = {},
): Promise<RenderResult> {
  const apiKey = process.env.SCRAPINGBEE_API_KEY;
  if (!apiKey) {
    return EMPTY_RESULT(url);
  }

  try {
    throwIfAborted(signal);

    const localeProfile = getRenderLocaleProfile(url);
    const params = new URLSearchParams({
      api_key: apiKey,
      url,
      render_js: "true",
      premium_proxy: "true",
      country_code: localeProfile.scrapingBeeCountry,
      wait_browser: "networkidle0",
      timeout: String(SCRAPINGBEE_TIMEOUT_MS),
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      SCRAPINGBEE_TIMEOUT_MS + 5_000,
    );

    // If the parent signal fires, abort the fetch too
    const onParentAbort = signal
      ? () => controller.abort()
      : undefined;
    if (signal && onParentAbort) {
      signal.addEventListener("abort", onParentAbort, { once: true });
    }

    try {
      const response = await fetch(
        `https://app.scrapingbee.com/api/v1/?${params.toString()}`,
        {
          signal: controller.signal,
          headers: { Accept: "text/html" },
        },
      );

      if (!response.ok) {
        return EMPTY_RESULT(url);
      }

      const html = await response.text();
      const resolvedUrl =
        response.headers.get("Spb-Resolved-Url") || url;

      return { html, url: resolvedUrl };
    } finally {
      clearTimeout(timeoutId);
    }
  } catch {
    return EMPTY_RESULT(url);
  }
}

/* ── Combined fallback chain for bot-protected pages ── */

export async function renderBotProtectedPage(
  url: string,
  { signal }: RenderOptions = {},
): Promise<RenderResult> {
  // Layer 2: Stealth browser
  const stealthResult = await renderPageStealth(url, { signal });
  if (stealthResult.html && stealthResult.html.length > 500) {
    return stealthResult;
  }

  // Bail early if parent has already timed out
  if (signal?.aborted) return EMPTY_RESULT(url);

  // Layer 3: ScrapingBee (if API key configured)
  const scrapingBeeResult = await renderPageScrapingBee(url, { signal });
  if (scrapingBeeResult.html && scrapingBeeResult.html.length > 500) {
    return scrapingBeeResult;
  }

  return EMPTY_RESULT(url);
}
