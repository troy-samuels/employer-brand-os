/**
 * @module app/dashboard/integration/page
 * Module implementation for page.tsx.
 */

'use client';

import { useState, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateApiKey, getApiKey } from '@/features/api-keys';
import type { GetApiKeyResult } from '@/features/api-keys';

const PIXEL_ENDPOINT_BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://rankwell.io';
const CDN_ENDPOINT = `${PIXEL_ENDPOINT_BASE.replace(/\/$/, '')}/api/pixel/v1/script`;

/**
 * Executes IntegrationPage.
 * @returns The resulting value.
 */
export default function IntegrationPage() {
  const [keyData, setKeyData] = useState<GetApiKeyResult | null>(null);
  const [newRawKey, setNewRawKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  // Fetch existing key on mount
  useEffect(() => {
    async function fetchKey() {
      const result = await getApiKey();
      setKeyData(result);
      setIsLoading(false);
    }
    fetchKey();
  }, []);

  const handleGenerateKey = () => {
    startTransition(async () => {
      const result = await generateApiKey('Production Key');
      if (result.success && result.rawKey) {
        setNewRawKey(result.rawKey);
        // Refresh key data
        const updated = await getApiKey();
        setKeyData(updated);
      }
    });
  };

  const handleCopySnippet = () => {
    const key = newRawKey || keyData?.keyPrefix || '';
    const snippet = generateSnippet(key);
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateSnippet = (key: string) => {
    return `<!-- Rankwell Smart Pixel -->
<script
  src="${CDN_ENDPOINT}"
  data-key="${key}"
  async
></script>`;
  };

  const displayKey = newRawKey || keyData?.keyPrefix || '';
  const hasKey = keyData?.hasKey || newRawKey;

  return (
    <div className="flex flex-col min-h-full bg-zinc-50">
      {/* Header */}
      <header className="sticky top-0 z-10 px-8 pt-8 pb-4 bg-white/50 backdrop-blur-xl border-b border-zinc-200/50">
        <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium mb-2">
          Integration
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
          Smart Pixel Setup
        </h1>
      </header>

      {/* Content */}
      <div className="flex-1 px-8 py-8">
        <div className="max-w-2xl space-y-8">
          {/* Introduction */}
          <p className="text-sm text-zinc-500 leading-relaxed">
            Deploy the Rankwell Smart Pixel to inject verified JSON-LD schema into your
            careers page. The pixel automatically updates when you modify your company facts.
          </p>

          {/* API Key Section */}
          <Card>
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
                  {/* Key Display */}
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

                  {/* Status */}
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

          {/* Code Snippet Section */}
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

                {/* Code Block */}
                <div className="relative">
                  <pre className="p-4 bg-zinc-900 rounded-lg overflow-x-auto">
                    <code className="text-sm font-mono text-zinc-100 whitespace-pre">
                      {generateSnippet(displayKey)}
                    </code>
                  </pre>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleCopySnippet}
                    className="absolute top-3 right-3 bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white text-xs"
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>

                {/* GTM Instructions */}
                <div className="pt-4 border-t border-zinc-200">
                  <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium mb-3">
                    Google Tag Manager Setup
                  </p>
                  <ol className="space-y-2 text-sm text-zinc-600">
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-zinc-100 rounded text-xs font-medium text-zinc-600">
                        1
                      </span>
                      <span>Create a new Custom HTML tag</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-zinc-100 rounded text-xs font-medium text-zinc-600">
                        2
                      </span>
                      <span>Paste the snippet above</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-zinc-100 rounded text-xs font-medium text-zinc-600">
                        3
                      </span>
                      <span>Set trigger to fire on your careers pages</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-zinc-100 rounded text-xs font-medium text-zinc-600">
                        4
                      </span>
                      <span>Publish your container</span>
                    </li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Verification Section */}
          {hasKey && (
            <Card>
              <CardHeader className="pb-4">
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium">
                  Testing
                </p>
                <CardTitle className="text-lg font-medium text-zinc-950">
                  Verify Installation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-zinc-500">
                  After deploying the pixel, verify it&apos;s working correctly:
                </p>
                <ol className="space-y-2 text-sm text-zinc-600">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-zinc-100 rounded text-xs font-medium text-zinc-600">
                      1
                    </span>
                    <span>Open your careers page in Chrome</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-zinc-100 rounded text-xs font-medium text-zinc-600">
                      2
                    </span>
                    <span>Open DevTools and go to Elements tab</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-zinc-100 rounded text-xs font-medium text-zinc-600">
                      3
                    </span>
                    <span>
                      Search for{' '}
                      <code className="px-1.5 py-0.5 bg-zinc-100 rounded text-xs">
                        application/ld+json
                      </code>
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-zinc-100 rounded text-xs font-medium text-zinc-600">
                      4
                    </span>
                    <span>Confirm your company data is present in the schema</span>
                  </li>
                </ol>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
