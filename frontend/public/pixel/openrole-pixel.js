/**
 * Deprecated OpenRole runtime.
 *
 * Compatibility bridge that forwards to the canonical OpenRole runtime:
 * /api/pixel/v1/script.
 */
(function () {
  "use strict";

  try {
    var current =
      document.currentScript ||
      document.querySelector(
        'script[data-openrole-key],script[data-key],script[data-openrole-key]'
      );
    if (!current) return;

    var key =
      (current.getAttribute("data-openrole-key") ||
        current.getAttribute("data-key") ||
        current.getAttribute("data-openrole-key") ||
        "").trim();
    if (!key) {
      // Older company-id based embeds are no longer supported.
      return;
    }

    var configuredBase =
      (current.getAttribute("data-openrole-api") ||
        current.getAttribute("data-api-base") ||
        current.getAttribute("data-api") ||
        "").trim();
    var location =
      (current.getAttribute("data-openrole-location") ||
        current.getAttribute("data-location") ||
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

    var existing = document.querySelector('script[data-openrole-runtime="v1"]');
    if (existing) return;

    var runtime = document.createElement("script");
    runtime.src = canonicalSrc;
    runtime.async = true;
    runtime.setAttribute("data-openrole-runtime", "v1");
    runtime.setAttribute("data-key", key);
    if (location) runtime.setAttribute("data-location", location);

    var nonce = current.getAttribute("nonce");
    if (nonce) runtime.setAttribute("nonce", nonce);

    (document.head || document.documentElement).appendChild(runtime);
  } catch {
    // Fail silent by design.
  }
})();
