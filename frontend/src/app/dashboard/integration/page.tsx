/**
 * @module app/dashboard/integration/page
 * Integration hub: Embeddable snippet + Smart Pixel setup
 */

'use client';

import { useState, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateApiKey, getApiKey } from '@/features/api-keys';
import type { GetApiKeyResult } from '@/features/api-keys';
import { generateSnippetCode, platformGuides, verificationSteps } from '@/lib/snippet/generator';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://openrole.co.uk';
const CDN_ENDPOINT = `${APP_URL.replace(/\/$/, '')}/api/pixel/v1/script`;

/**
 * Integration page with embeddable snippet + Smart Pixel
 */
export default function IntegrationPage() {
  // Smart Pixel state (existing)
  const [keyData, setKeyData] = useState<GetApiKeyResult | null>(null);
  const [newRawKey, setNewRawKey] = useState<string | null>(null);
  const [pixelCopied, setPixelCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  // Snippet state (new)
  const [snippetCopied, setSnippetCopied] = useState(false);
  const [schemaPreview, setSchemaPreview] = useState<Record<string, unknown> | null>(null);
  const [installStatus, setInstallStatus] = useState<{
    installed: boolean;
    lastSeen?: string;
    domain?: string;
  } | null>(null);

  // Mock company slug - in production, fetch from user's org
  const companySlug = 'demo-company'; // TODO: Get from auth context

  // Fetch existing Smart Pixel key on mount
  useEffect(() => {
    async function fetchKey() {
      const result = await getApiKey();
      setKeyData(result);
      setIsLoading(false);
    }
    fetchKey();
  }, []);

  // Fetch snippet preview and status
  useEffect(() => {
    async function fetchSnippetData() {
      try {
        // Fetch the snippet to get schema preview
        const response = await fetch(`/api/snippet/${companySlug}`);
        if (response.ok) {
          const js = await response.text();
          // Extract JSON from the generated JavaScript
          const match = js.match(/s\.textContent=(".*?")/);
          if (match) {
            const schemaJson = JSON.parse(JSON.parse(match[1]));
            setSchemaPreview(schemaJson);
          }
        }

        // Fetch installation status (if endpoint exists)
        // TODO: Create /api/snippet/status/[slug] endpoint
      } catch (error) {
        console.error('Failed to fetch snippet data:', error);
      }
    }

    fetchSnippetData();
  }, [companySlug]);

  const handleGenerateKey = () => {
    startTransition(async () => {
      const result = await generateApiKey('Production Key');
      if (result.success && result.rawKey) {
        setNewRawKey(result.rawKey);
        const updated = await getApiKey();
        setKeyData(updated);
      }
    });
  };

  const handleCopyPixelSnippet = () => {
    if (!newRawKey) {
      return;
    }
    const snippet = generatePixelSnippet(newRawKey);
    navigator.clipboard.writeText(snippet);
    setPixelCopied(true);
    setTimeout(() => setPixelCopied(false), 2000);
  };

  const handleCopyEmbedSnippet = () => {
    const snippet = generateSnippetCode(companySlug);
    navigator.clipboard.writeText(snippet);
    setSnippetCopied(true);
    setTimeout(() => setSnippetCopied(false), 2000);
  };

  const handleCopySchema = () => {
    if (schemaPreview) {
      navigator.clipboard.writeText(JSON.stringify(schemaPreview, null, 2));
    }
  };

  const generatePixelSnippet = (key: string | null) => {
    const installKey = key?.trim() || 'REPLACE_WITH_FULL_BOS_KEY';
    return `<!-- OpenRole Smart Pixel -->
<script
  src="${CDN_ENDPOINT}"
  data-key="${installKey}"
  async
></script>`;
  };

  const displayKey = newRawKey || keyData?.keyPrefix || '';
  const hasKey = keyData?.hasKey || newRawKey;
  const canCopyInstallSnippet = Boolean(newRawKey);

  return (
    <div className="flex flex-col min-h-full bg-zinc-50">
      {/* Header */}
      <header className="sticky top-0 z-10 px-8 pt-8 pb-4 bg-white/50 backdrop-blur-xl border-b border-zinc-200/50">
        <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium mb-2">
          Integration
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
          Website Integration
        </h1>
        <p className="text-sm text-zinc-500 mt-2">
          Add structured data to your careers page for better AI visibility
        </p>
      </header>

      {/* Content */}
      <div className="flex-1 px-8 py-8">
        <div className="max-w-4xl space-y-12">
          
          {/* ========== EMBEDDABLE SNIPPET SECTION (NEW) ========== */}
          <section>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-zinc-900 mb-1">
                Embeddable Schema Snippet
              </h2>
              <p className="text-sm text-zinc-500">
                Drop-in JavaScript that injects verified JSON-LD into your careers page.
                No IT required — paste directly into your CMS.
              </p>
            </div>

            {/* The Snippet Code */}
            <Card className="mb-6">
              <CardHeader className="pb-4">
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium">
                  Your Snippet
                </p>
                <CardTitle className="text-lg font-medium text-zinc-950">
                  Copy & Paste Code
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-zinc-500">
                  Add this to your careers page, before the closing{' '}
                  <code className="px-1.5 py-0.5 bg-zinc-100 rounded text-xs">&lt;/head&gt;</code>{' '}
                  tag:
                </p>

                <div className="relative">
                  <pre className="p-4 bg-zinc-900 rounded-lg overflow-x-auto">
                    <code className="text-sm font-mono text-zinc-100 whitespace-pre">
                      {generateSnippetCode(companySlug)}
                    </code>
                  </pre>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleCopyEmbedSnippet}
                    className="absolute top-3 right-3 bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white text-xs"
                  >
                    {snippetCopied ? 'Copied ✓' : 'Copy'}
                  </Button>
                </div>

                {/* Installation Status */}
                {installStatus && (
                  <div className="flex items-center gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        installStatus.installed ? 'bg-emerald-500' : 'bg-zinc-300'
                      }`} />
                      <span className="text-sm text-zinc-600">
                        {installStatus.installed ? 'Installed' : 'Not installed'}
                      </span>
                    </div>
                    {installStatus.lastSeen && (
                      <span className="text-xs text-zinc-400">
                        Last seen: {installStatus.lastSeen}
                      </span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Installation Guide - Platform Tabs */}
            <Card className="mb-6">
              <CardHeader className="pb-4">
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium">
                  Platform Guides
                </p>
                <CardTitle className="text-lg font-medium text-zinc-950">
                  How to Install
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="wordpress">
                  <TabsList className="mb-6">
                    {platformGuides.map((guide) => (
                      <TabsTrigger key={guide.name.toLowerCase()} value={guide.name.toLowerCase()}>
                        {guide.icon} {guide.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {platformGuides.map((guide) => (
                    <TabsContent key={guide.name.toLowerCase()} value={guide.name.toLowerCase()}>
                      <ol className="space-y-3">
                        {guide.steps.map((step, idx) => (
                          <li key={idx} className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-zinc-100 rounded text-xs font-medium text-zinc-600">
                              {idx + 1}
                            </span>
                            <span className="text-sm text-zinc-600 leading-relaxed">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>

            {/* Schema Preview */}
            {schemaPreview && (
              <Card className="mb-6">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium">
                        Schema Preview
                      </p>
                      <CardTitle className="text-lg font-medium text-zinc-950">
                        JSON-LD Output
                      </CardTitle>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleCopySchema}
                      className="text-xs"
                    >
                      Copy JSON
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="p-4 bg-zinc-50 rounded-lg overflow-x-auto max-h-96 text-xs font-mono text-zinc-800">
                    {JSON.stringify(schemaPreview, null, 2)}
                  </pre>
                  <div className="mt-4 pt-4 border-t border-zinc-200">
                    <a
                      href={`https://search.google.com/test/rich-results?url=${encodeURIComponent(APP_URL)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      Validate with Google Rich Results Test →
                    </a>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Verification Steps */}
            <Card>
              <CardHeader className="pb-4">
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium">
                  Testing
                </p>
                <CardTitle className="text-lg font-medium text-zinc-950">
                  Verify Installation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3">
                  {verificationSteps.map((step, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-zinc-100 rounded text-xs font-medium text-zinc-600">
                        {idx + 1}
                      </span>
                      <span className="text-sm text-zinc-600 leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </section>

          {/* ========== REVERSE PROXY FACTS PAGE (NEW) ========== */}
          <section className="pt-8 border-t border-zinc-200">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-zinc-900 mb-1">
                AI Facts Page (Level 3 AEO)
              </h2>
              <p className="text-sm text-zinc-500">
                A standalone facts page served on your domain that AI crawlers will index and cite.
                Maximum domain authority for AI-powered search.
              </p>
            </div>

            {/* What it is */}
            <Card className="mb-6">
              <CardHeader className="pb-4">
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium">
                  How It Works
                </p>
                <CardTitle className="text-lg font-medium text-zinc-950">
                  Domain Authority + Verified Facts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-zinc-600">
                <p>
                  Point a subfolder on your domain (e.g., <code className="px-1.5 py-0.5 bg-zinc-100 rounded text-xs">yourdomain.com/ai-facts</code>) to our facts page via reverse proxy.
                </p>
                <p>
                  When Bing, Google, or Perplexity crawl for employer data, they'll find <strong>your domain</strong> (high authority) serving <strong>verified facts</strong> (high quality).
                </p>
                <p className="text-zinc-500 text-xs">
                  Result: Your domain ranks above Glassdoor, Indeed, and anonymous review sites in AI responses.
                </p>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card className="mb-6">
              <CardHeader className="pb-4">
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium">
                  Your Facts Page
                </p>
                <CardTitle className="text-lg font-medium text-zinc-950">
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-zinc-500">
                  See what AI crawlers will see when they visit your facts page:
                </p>
                <div className="flex gap-3">
                  <a
                    href={`${APP_URL}/api/facts-page/${companySlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition"
                  >
                    Open Preview →
                  </a>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(`${APP_URL}/api/facts-page/${companySlug}`);
                    }}
                    className="text-xs"
                  >
                    Copy URL
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Setup Instructions - Platform Tabs */}
            <Card className="mb-6">
              <CardHeader className="pb-4">
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium">
                  Setup
                </p>
                <CardTitle className="text-lg font-medium text-zinc-950">
                  Reverse Proxy Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-zinc-500 mb-6">
                  Choose your platform and add the proxy rule. IT support may be required.
                </p>
                
                <Tabs defaultValue="cloudflare">
                  <TabsList className="mb-6">
                    <TabsTrigger value="cloudflare">☁️ Cloudflare</TabsTrigger>
                    <TabsTrigger value="nginx">🔧 Nginx</TabsTrigger>
                    <TabsTrigger value="vercel">▲ Vercel</TabsTrigger>
                    <TabsTrigger value="wordpress">📝 WordPress</TabsTrigger>
                    <TabsTrigger value="netlify">🌐 Netlify</TabsTrigger>
                  </TabsList>

                  <TabsContent value="cloudflare">
                    <div className="space-y-3 text-sm text-zinc-600">
                      <p className="font-medium text-zinc-900">Cloudflare Page Rule or Worker</p>
                      <p>In your Cloudflare dashboard, add a Page Rule or Worker route:</p>
                      <pre className="p-4 bg-zinc-900 rounded-lg overflow-x-auto text-xs font-mono text-zinc-100">
{`URL: yourdomain.com/ai-facts*
Forward to: ${APP_URL}/api/facts-page/${companySlug}`}
                      </pre>
                      <p className="text-xs text-zinc-500">
                        Cloudflare will proxy requests to our endpoint while keeping your domain in the browser.
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="nginx">
                    <div className="space-y-3 text-sm text-zinc-600">
                      <p className="font-medium text-zinc-900">Nginx Configuration</p>
                      <p>Add this location block to your nginx config:</p>
                      <pre className="p-4 bg-zinc-900 rounded-lg overflow-x-auto text-xs font-mono text-zinc-100">
{`location /ai-facts {
    proxy_pass ${APP_URL}/api/facts-page/${companySlug};
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}`}
                      </pre>
                      <p className="text-xs text-zinc-500">
                        Reload nginx: <code className="px-1 py-0.5 bg-zinc-100 rounded">sudo nginx -s reload</code>
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="vercel">
                    <div className="space-y-3 text-sm text-zinc-600">
                      <p className="font-medium text-zinc-900">Vercel Rewrites</p>
                      <p>Add this to your <code className="px-1 py-0.5 bg-zinc-100 rounded">next.config.js</code>:</p>
                      <pre className="p-4 bg-zinc-900 rounded-lg overflow-x-auto text-xs font-mono text-zinc-100">
{`async rewrites() {
  return [
    {
      source: '/ai-facts',
      destination: '${APP_URL}/api/facts-page/${companySlug}'
    }
  ]
}`}
                      </pre>
                      <p className="text-xs text-zinc-500">
                        Deploy to apply changes. The page will be served at yourdomain.com/ai-facts
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="wordpress">
                    <div className="space-y-3 text-sm text-zinc-600">
                      <p className="font-medium text-zinc-900">WordPress .htaccess</p>
                      <p>Add this to your <code className="px-1 py-0.5 bg-zinc-100 rounded">.htaccess</code> file (requires mod_proxy):</p>
                      <pre className="p-4 bg-zinc-900 rounded-lg overflow-x-auto text-xs font-mono text-zinc-100">
{`RewriteEngine On
RewriteRule ^ai-facts$ ${APP_URL}/api/facts-page/${companySlug} [P,L]`}
                      </pre>
                      <p className="text-xs text-zinc-500">
                        Alternative: Use a plugin like "Simple 301 Redirects" for easier management.
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="netlify">
                    <div className="space-y-3 text-sm text-zinc-600">
                      <p className="font-medium text-zinc-900">Netlify Redirects</p>
                      <p>Add this to your <code className="px-1 py-0.5 bg-zinc-100 rounded">_redirects</code> file:</p>
                      <pre className="p-4 bg-zinc-900 rounded-lg overflow-x-auto text-xs font-mono text-zinc-100">
{`/ai-facts ${APP_URL}/api/facts-page/${companySlug} 200`}
                      </pre>
                      <p className="text-xs text-zinc-500">
                        The <code className="px-1 py-0.5 bg-zinc-100 rounded">200</code> status code tells Netlify to proxy (not redirect).
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Verification Checklist */}
            <Card>
              <CardHeader className="pb-4">
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium">
                  Testing
                </p>
                <CardTitle className="text-lg font-medium text-zinc-950">
                  Verify Installation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-zinc-100 rounded text-xs font-medium text-zinc-600">
                      1
                    </span>
                    <span className="text-sm text-zinc-600 leading-relaxed">
                      Add the proxy/redirect rule using one of the methods above
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-zinc-100 rounded text-xs font-medium text-zinc-600">
                      2
                    </span>
                    <span className="text-sm text-zinc-600 leading-relaxed">
                      Visit <code className="px-1.5 py-0.5 bg-zinc-100 rounded text-xs">yourdomain.com/ai-facts</code> in your browser — you should see your facts page
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-zinc-100 rounded text-xs font-medium text-zinc-600">
                      3
                    </span>
                    <span className="text-sm text-zinc-600 leading-relaxed">
                      Open Google Search Console and use the{' '}
                      <a 
                        href="https://search.google.com/search-console" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        URL Inspection tool
                      </a>{' '}
                      to verify Google can crawl and index the page
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-zinc-100 rounded text-xs font-medium text-zinc-600">
                      4
                    </span>
                    <span className="text-sm text-zinc-600 leading-relaxed">
                      Wait 2-4 weeks for AI systems to recrawl and update their knowledge bases
                    </span>
                  </li>
                </ol>
              </CardContent>
            </Card>
          </section>

          {/* ========== SMART PIXEL SECTION (EXISTING) ========== */}
          <section className="pt-8 border-t border-zinc-200">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-zinc-900 mb-1">
                Smart Pixel (Advanced)
              </h2>
              <p className="text-sm text-zinc-500">
                Dynamic pixel for real-time schema updates. Requires API key.
              </p>
            </div>

            {/* API Key Section */}
            <Card className="mb-6">
              <CardHeader className="pb-4">
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium">
                  API Key
                </p>
                <CardTitle className="text-lg font-medium text-zinc-950">
                  Production Credentials
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="h-12 bg-zinc-100/50 rounded-lg animate-pulse" />
                ) : !hasKey ? (
                  <div className="space-y-4">
                    <p className="text-sm text-zinc-500">
                      Generate a production API key to activate the Smart Pixel on your website.
                    </p>
                    <Button
                      onClick={handleGenerateKey}
                      disabled={isPending}
                      className="bg-zinc-900 text-white hover:bg-zinc-800"
                    >
                      {isPending ? 'Generating...' : 'Generate Production Key'}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium">
                        {newRawKey ? 'Your API Key (copy now - shown once)' : 'Key Prefix'}
                      </p>
                      <div className="flex items-center gap-3">
                        <code className="flex-1 px-4 py-3 bg-zinc-100 rounded-lg font-mono text-sm text-zinc-900 select-all">
                          {displayKey}
                        </code>
                      </div>
                      {newRawKey && (
                        <p className="text-xs text-amber-600 font-medium">
                          Save this key now. It will not be shown again.
                        </p>
                      )}
                    </div>

                    {keyData?.key && (
                      <div className="flex items-center gap-6 text-xs text-zinc-500">
                        <span>
                          Status: <span className="text-emerald-600 font-medium">Active</span>
                        </span>
                        {keyData.key.lastUsedAt && (
                          <span>
                            Last used: {new Date(keyData.key.lastUsedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Smart Pixel Code Snippet */}
            {hasKey && (
              <Card>
                <CardHeader className="pb-4">
                  <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium">
                    Installation
                  </p>
                  <CardTitle className="text-lg font-medium text-zinc-950">
                    Smart Pixel Code
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-zinc-500">
                    Add this snippet to your careers page, just before the closing{' '}
                    <code className="px-1.5 py-0.5 bg-zinc-100 rounded text-xs">&lt;/head&gt;</code>{' '}
                    tag. For Google Tag Manager, create a Custom HTML tag.
                  </p>

                  {!canCopyInstallSnippet && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                      This account currently only has a stored key prefix. To install on a new site,
                      rotate the key to reveal a full key once.
                    </div>
                  )}

                  <div className="relative">
                    <pre className="p-4 bg-zinc-900 rounded-lg overflow-x-auto">
                      <code className="text-sm font-mono text-zinc-100 whitespace-pre">
                        {generatePixelSnippet(newRawKey)}
                      </code>
                    </pre>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleCopyPixelSnippet}
                      disabled={!canCopyInstallSnippet}
                      className="absolute top-3 right-3 bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white text-xs"
                    >
                      {pixelCopied ? 'Copied ✓' : 'Copy'}
                    </Button>
                  </div>

                  {!newRawKey && (
                    <Button
                      onClick={handleGenerateKey}
                      disabled={isPending}
                      className="bg-zinc-900 text-white hover:bg-zinc-800"
                    >
                      {isPending ? 'Rotating...' : 'Rotate Key & Reveal Full Install Key'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
