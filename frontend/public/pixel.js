/**
 * BrandOS Smart Pixel v1.0
 * Injects verified employer JSON-LD schema into client websites
 *
 * Usage:
 * <script src="https://cdn.brandos.com/pixel.js" data-key="bos_live_xxx" async></script>
 *
 * Options:
 * - data-key: Required. Your BrandOS API key
 * - data-location: Optional. Location UUID for multi-location companies
 * - data-debug: Optional. Set to "true" for console logging
 * - data-api: Optional. Override API base URL (for testing)
 *
 * Events:
 * - brandos:loaded - Fired when JSON-LD is successfully injected
 * - brandos:error - Fired on any error (page continues normally)
 *
 * @license MIT
 * @copyright BrandOS 2024
 */
(function() {
  'use strict';

  // 1. Find our script tag to extract configuration
  // document.currentScript is the preferred method, fallback to querySelector
  var script = document.currentScript ||
    document.querySelector('script[data-key^="bos_"]');

  // Silent fail if script tag not found
  if (!script) return;

  // 2. Extract configuration from data attributes
  var config = {
    key: script.getAttribute('data-key'),
    location: script.getAttribute('data-location'),
    debug: script.getAttribute('data-debug') === 'true',
    apiBase: script.getAttribute('data-api') || 'https://app.brandos.com'
  };

  // Silent fail if no API key provided
  if (!config.key) return;

  // 3. Debug logger - silent unless explicitly enabled
  var log = config.debug
    ? function() {
        var args = Array.prototype.slice.call(arguments);
        args.unshift('[BrandOS]');
        console.log.apply(console, args);
      }
    : function() {};

  // 4. Build API URL with query parameters
  var url = config.apiBase + '/api/pixel/v1/facts?key=' +
    encodeURIComponent(config.key);

  if (config.location) {
    url += '&location=' + encodeURIComponent(config.location);
  }

  log('Fetching employer facts from:', url);

  // 5. Fetch JSON-LD data (async, non-blocking)
  fetch(url, {
    method: 'GET',
    mode: 'cors',
    credentials: 'omit',
    cache: 'default'
  })
  .then(function(response) {
    if (!response.ok) {
      // Extract error message from response if possible
      return response.json().then(function(err) {
        throw new Error(err.message || 'API error: ' + response.status);
      }).catch(function() {
        throw new Error('API error: ' + response.status);
      });
    }
    return response.json();
  })
  .then(function(jsonLd) {
    // 6. Create and inject JSON-LD script tag into <head>
    var el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = 'brandos-jsonld';
    el.textContent = JSON.stringify(jsonLd);

    // Remove existing BrandOS JSON-LD if present (avoid duplicates on SPA navigation)
    var existing = document.getElementById('brandos-jsonld');
    if (existing) {
      existing.parentNode.removeChild(existing);
    }

    document.head.appendChild(el);

    log('JSON-LD injected successfully:', jsonLd.name || 'Organization');

    // 7. Fire success event for client-side tracking
    if (typeof CustomEvent === 'function') {
      document.dispatchEvent(new CustomEvent('brandos:loaded', {
        detail: {
          organization: jsonLd.name,
          type: jsonLd['@type']
        }
      }));
    }
  })
  .catch(function(error) {
    log('Error:', error.message);

    // 8. Fire error event (page continues normally)
    if (typeof CustomEvent === 'function') {
      document.dispatchEvent(new CustomEvent('brandos:error', {
        detail: {
          error: error.message
        }
      }));
    }
    // Never throw - fail silently to avoid breaking client's site
  });
})();
