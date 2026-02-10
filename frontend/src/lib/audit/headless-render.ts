import chromium from "@sparticuz/chromium";
import { chromium as playwrightChromium } from "playwright-core";

const RENDER_TIMEOUT_MS = 8000;

export async function renderPage(url: string): Promise<{ html: string; url: string }> {
  let browser: Awaited<ReturnType<typeof playwrightChromium.launch>> | null = null;

  try {
    const executablePath = await chromium.executablePath();
    browser = await playwrightChromium.launch({
      args: chromium.args,
      executablePath,
      headless: true,
    });

    const page = await browser.newPage();

    try {
      await page.goto(url, {
        waitUntil: "networkidle",
        timeout: RENDER_TIMEOUT_MS,
      });
    } catch {
      // Best effort: continue with whatever the page rendered before timeout/error.
    }

    const html = await page.content();
    const finalUrl = page.url();

    return {
      html,
      url: finalUrl && finalUrl !== "about:blank" ? finalUrl : url,
    };
  } catch {
    return { html: "", url };
  } finally {
    if (browser) {
      await browser.close().catch(() => undefined);
    }
  }
}
