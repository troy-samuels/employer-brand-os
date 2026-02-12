/**
 * Legacy compatibility loader for older Rankwell/BrandOS embeds.
 *
 * Canonical runtime is served from /api/pixel/v1/script.
 * This file forwards legacy data attributes to the canonical runtime.
 */
(function () {
  "use strict";

  try {
    var current =
      document.currentScript ||
      document.querySelector('script[data-key],script[data-rankwell-key],script[data-brandos-key]');

    if (!current) return;

    var key =
      (current.getAttribute("data-key") ||
        current.getAttribute("data-rankwell-key") ||
        current.getAttribute("data-brandos-key") ||
        "").trim();
    if (!key) return;

    var location =
      (current.getAttribute("data-location") ||
        current.getAttribute("data-brandos-location") ||
        "").trim();

    var configuredBase =
      (current.getAttribute("data-api-base") ||
        current.getAttribute("data-api") ||
        current.getAttribute("data-brandos-api") ||
        "").trim();

    var origin = "";
    try {
      if (configuredBase) {
        origin = new URL(configuredBase, document.baseURI || window.location.href).origin;
      } else {
        origin = new URL(current.src, document.baseURI || window.location.href).origin;
      }
    } catch {
      origin = window.location.origin;
    }

    var canonicalSrc = origin.replace(/\/$/, "") + "/api/pixel/v1/script";

    var existing = document.querySelector('script[data-rankwell-runtime="v1"]');
    if (existing) return;

    var runtime = document.createElement("script");
    runtime.src = canonicalSrc;
    runtime.async = true;
    runtime.setAttribute("data-rankwell-runtime", "v1");
    runtime.setAttribute("data-key", key);
    if (location) runtime.setAttribute("data-location", location);

    var nonce = current.getAttribute("nonce");
    if (nonce) runtime.setAttribute("nonce", nonce);

    (document.head || document.documentElement).appendChild(runtime);
  } catch {
    // Fail silent by design.
  }
})();
