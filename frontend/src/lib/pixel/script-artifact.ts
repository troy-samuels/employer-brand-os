/**
 * @module lib/pixel/script-artifact
 * Module implementation for script-artifact.ts.
 */

import { createHash } from "node:crypto";

/**
 * Exposes exported value(s): PIXEL_SCRIPT_VERSION.
 */
export const PIXEL_SCRIPT_VERSION = "1.0.0";

/**
 * Exposes exported value(s): PIXEL_SCRIPT_BODY.
 */
export const PIXEL_SCRIPT_BODY = `(() => {
  const EMPTY_SHA256 = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

  function resolveScriptTag() {
    if (document.currentScript) {
      return document.currentScript;
    }

    const scripts = document.getElementsByTagName("script");
    for (let i = scripts.length - 1; i >= 0; i -= 1) {
      const src = scripts[i].getAttribute("src") || "";
      if (src.includes("/api/pixel/v1/script")) {
        return scripts[i];
      }
    }

    return null;
  }

  function randomNonce() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }

    return String(Date.now()) + Math.random().toString(16).slice(2);
  }

  function toBase64(buffer) {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.length; i += 1) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  async function signRequest(secret, payload) {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
    return toBase64(signature);
  }

  async function fetchJsonLd(config) {
    const factsUrl = new URL("/api/pixel/v1/facts", config.apiBase);
    factsUrl.searchParams.set("key", config.apiKey);
    if (config.location) {
      factsUrl.searchParams.set("location", config.location);
    }

    const timestamp = String(Math.floor(Date.now() / 1000));
    const nonce = randomNonce();
    const pathWithQuery = factsUrl.pathname + factsUrl.search;
    const payload = ["GET", pathWithQuery, timestamp, nonce, EMPTY_SHA256].join("\\n");
    const signature = await signRequest(config.apiKey, payload);

    const response = await fetch(factsUrl.toString(), {
      method: "GET",
      mode: "cors",
      credentials: "omit",
      headers: {
        "X-Rankwell-Timestamp": timestamp,
        "X-Rankwell-Nonce": nonce,
        "X-Rankwell-Signature": signature
      }
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  }

  async function injectSchema(config) {
    try {
      const schema = await fetchJsonLd(config);
      if (!schema || typeof schema !== "object") {
        return;
      }

      const existing = document.getElementById("rankwell-pixel-jsonld");
      if (existing && existing.parentNode) {
        existing.parentNode.removeChild(existing);
      }

      const node = document.createElement("script");
      node.type = "application/ld+json";
      node.id = "rankwell-pixel-jsonld";
      node.text = JSON.stringify(schema);
      document.head.appendChild(node);
    } catch {
      // No-op by design: the host page should never break because of the pixel.
    }
  }

  const scriptTag = resolveScriptTag();
  if (!scriptTag) {
    return;
  }

  const apiKey = scriptTag.getAttribute("data-key");
  if (!apiKey) {
    return;
  }

  const apiBase = scriptTag.getAttribute("data-api-base") || new URL(scriptTag.src).origin;
  const location = scriptTag.getAttribute("data-location") || "";

  injectSchema({
    apiKey,
    apiBase,
    location
  });
})();`;

const sriDigest = createHash("sha384").update(PIXEL_SCRIPT_BODY).digest("base64");
const etagDigest = createHash("sha256").update(PIXEL_SCRIPT_BODY).digest("hex");

/**
 * Exposes exported value(s): PIXEL_SCRIPT_SRI.
 */
export const PIXEL_SCRIPT_SRI = `sha384-${sriDigest}`;
/**
 * Exposes exported value(s): PIXEL_SCRIPT_ETAG.
 */
export const PIXEL_SCRIPT_ETAG = `"pixel-${PIXEL_SCRIPT_VERSION}-${etagDigest.slice(0, 24)}"`;
