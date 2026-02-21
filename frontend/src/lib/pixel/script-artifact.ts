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
  try {
    const EMPTY_SHA256 = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
    const globalObject = typeof window === "object" ? window : null;
    const doc = typeof document === "object" ? document : null;

    if (!globalObject || !doc) {
      return;
    }

    function noop() {}

    function resolveScriptTag() {
      try {
        if (doc.currentScript) {
          return doc.currentScript;
        }

        const scripts = doc.getElementsByTagName("script");
        for (let i = scripts.length - 1; i >= 0; i -= 1) {
          const src = scripts[i].getAttribute("src") || "";
          if (src.includes("/api/pixel/v1/script")) {
            return scripts[i];
          }
        }
      } catch {}

      return null;
    }

    function randomNonce() {
      try {
        const cryptoObject = globalObject.crypto;
        if (cryptoObject && typeof cryptoObject.randomUUID === "function") {
          return cryptoObject.randomUUID();
        }

        if (cryptoObject && typeof cryptoObject.getRandomValues === "function") {
          const bytes = new Uint8Array(16);
          cryptoObject.getRandomValues(bytes);
          let token = "";
          for (let index = 0; index < bytes.length; index += 1) {
            token += bytes[index].toString(16).padStart(2, "0");
          }
          return token;
        }
      } catch {}

      return String(Date.now()) + Math.random().toString(16).slice(2);
    }

    function toBase64(buffer) {
      try {
        if (typeof btoa !== "function") {
          return "";
        }

        let binary = "";
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.length; i += 1) {
          binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
      } catch {
        return "";
      }
    }

    function parseJson(text) {
      try {
        return JSON.parse(text);
      } catch {
        return null;
      }
    }

    function resolveApiBase(scriptTag) {
      try {
        const configuredBase =
          scriptTag.getAttribute("data-api-base") ||
          scriptTag.getAttribute("data-api");
        if (configuredBase) {
          return configuredBase;
        }

        const source = scriptTag.getAttribute("src");
        if (source) {
          const baseHref =
            doc.baseURI || (globalObject.location ? globalObject.location.href : "");
          return new URL(source, baseHref).origin;
        }

        return globalObject.location ? globalObject.location.origin : "";
      } catch {
        return "";
      }
    }

    function resolveApiKey(scriptTag) {
      return (
        scriptTag.getAttribute("data-key") ||
        scriptTag.getAttribute("data-openrole-key") ||
        scriptTag.getAttribute("data-openrole-key") ||
        ""
      ).trim();
    }

    function resolveScriptNonce(scriptTag) {
      try {
        const directNonce = scriptTag.getAttribute("nonce");
        if (directNonce) {
          return directNonce;
        }

        const nonceMeta = doc.querySelector('meta[name="csp-nonce"]');
        if (nonceMeta) {
          const metaValue = nonceMeta.getAttribute("content");
          if (metaValue) {
            return metaValue;
          }
        }

        const nonceScript = doc.querySelector("script[nonce]");
        if (nonceScript) {
          return nonceScript.getAttribute("nonce") || "";
        }
      } catch {}

      return "";
    }

    async function signRequest(secret, payload) {
      try {
        const cryptoObject = globalObject.crypto;
        if (!cryptoObject || !cryptoObject.subtle || typeof TextEncoder !== "function") {
          return "";
        }

        const encoder = new TextEncoder();
        const key = await cryptoObject.subtle.importKey(
          "raw",
          encoder.encode(secret),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign"]
        );
        const signature = await cryptoObject.subtle.sign(
          "HMAC",
          key,
          encoder.encode(payload)
        );
        return toBase64(signature);
      } catch {
        return "";
      }
    }

    async function fetchJsonLd(config) {
      try {
        if (typeof fetch !== "function" || typeof URL !== "function") {
          return null;
        }

        const factsUrl = new URL("/api/pixel/v1/facts", config.apiBase);
        if (config.location) {
          factsUrl.searchParams.set("location", config.location);
        }

        const timestamp = String(Math.floor(Date.now() / 1000));
        const nonce = randomNonce();
        const pathWithQuery = factsUrl.pathname + factsUrl.search;
        const payload = ["GET", pathWithQuery, timestamp, nonce, EMPTY_SHA256].join("\\n");
        const signature = await signRequest(config.apiKey, payload);

        if (!signature) {
          return null;
        }

        let response;
        try {
          response = await fetch(factsUrl.toString(), {
            method: "GET",
              mode: "cors",
              credentials: "omit",
              headers: {
                "X-OpenRole-Key": config.apiKey,
                "X-OpenRole-Timestamp": timestamp,
                "X-OpenRole-Nonce": nonce,
                "X-OpenRole-Signature": signature
            }
          });
        } catch {
          return null;
        }

        if (!response || !response.ok) {
          return null;
        }

        const text = await response.text();
        if (!text) {
          return null;
        }

        const parsed = parseJson(text);
        if (!parsed || typeof parsed !== "object") {
          return null;
        }

        return parsed;
      } catch {
        return null;
      }
    }

    async function injectSchema(config) {
      try {
        const schema = await fetchJsonLd(config);
        if (!schema || typeof schema !== "object") {
          return;
        }

        const existing = doc.getElementById("openrole-pixel-jsonld");
        if (existing && existing.parentNode) {
          existing.parentNode.removeChild(existing);
        }

        const head = doc.head || doc.getElementsByTagName("head")[0];
        if (!head) {
          return;
        }

        const node = doc.createElement("script");
        node.type = "application/ld+json";
        node.id = "openrole-pixel-jsonld";
        if (config.nonce) {
          node.setAttribute("nonce", config.nonce);
        }
        node.text = JSON.stringify(schema);
        head.appendChild(node);
      } catch {}
    }

    function createDebouncedInjector(config) {
      let timer = null;
      let pending = null;

      return () => {
        if (timer) {
          clearTimeout(timer);
        }

        timer = setTimeout(() => {
          timer = null;
          pending = injectSchema(config);
          if (pending && typeof pending.catch === "function") {
            pending.catch(noop);
          }
        }, 120);
      };
    }

    function installSpaNavigationHooks(onNavigate) {
      try {
        if (globalObject.__openrolePixelNavHookInstalled) {
          return;
        }
        globalObject.__openrolePixelNavHookInstalled = true;

        const historyObject = globalObject.history;
        if (!historyObject) {
          return;
        }

        const wrapHistoryMethod = (methodName) => {
          const original = historyObject[methodName];
          if (typeof original !== "function") {
            return;
          }

          historyObject[methodName] = function() {
            const result = original.apply(this, arguments);
            try {
              globalObject.dispatchEvent(new Event("openrole:navigation"));
            } catch {}
            return result;
          };
        };

        wrapHistoryMethod("pushState");
        wrapHistoryMethod("replaceState");

        globalObject.addEventListener("popstate", onNavigate, { passive: true });
        globalObject.addEventListener("hashchange", onNavigate, { passive: true });
        globalObject.addEventListener("openrole:navigation", onNavigate, { passive: true });
      } catch {}
    }

    const scriptTag = resolveScriptTag();
    if (!scriptTag) {
      return;
    }

    const apiKey = resolveApiKey(scriptTag);
    if (!apiKey) {
      return;
    }

    const apiBase = resolveApiBase(scriptTag);
    if (!apiBase) {
      return;
    }

    const nonce = resolveScriptNonce(scriptTag);
    const location = (scriptTag.getAttribute("data-location") || "").trim();
    const config = {
      apiKey,
      apiBase,
      location,
      nonce
    };

    const triggerInjection = createDebouncedInjector(config);
    triggerInjection();
    installSpaNavigationHooks(triggerInjection);

    if (typeof MutationObserver === "function") {
      const mutationObserver = new MutationObserver(() => {
        const injected = doc.getElementById("openrole-pixel-jsonld");
        if (!injected) {
          triggerInjection();
        }
      });
      try {
        mutationObserver.observe(doc.documentElement || doc, {
          childList: true,
          subtree: true
        });
      } catch {}
    }

    if (typeof globalObject.setInterval === "function") {
      globalObject.setInterval(() => {
        const injected = doc.getElementById("openrole-pixel-jsonld");
        if (!injected) {
          triggerInjection();
        }
      }, 8000);
    }
  } catch {}
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
