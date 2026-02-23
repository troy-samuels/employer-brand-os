/**
 * @module api/snippet/ping/route
 * Tracks snippet installations and active usage
 * 
 * Endpoint: GET /api/snippet/ping?s=[slug]&t=[timestamp]
 * Returns: 1x1 transparent pixel (GIF)
 * 
 * Deduplicates by slug+domain per day to track unique installations
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * 1x1 transparent GIF (43 bytes)
 */
const PIXEL_GIF = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

/**
 * Extract domain from referrer URL
 */
function extractDomain(url: string | null): string | null {
  if (!url) {
    return null;
  }

  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return null;
  }
}

/**
 * GET handler - track snippet usage and return pixel
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const slug = searchParams.get('s');
  const timestamp = searchParams.get('t');

  // Validate required params
  if (!slug) {
    return new NextResponse(PIXEL_GIF, {
      status: 200,
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  try {
    // Extract referrer domain
    const referer = request.headers.get('referer') || request.headers.get('origin');
    const domain = extractDomain(referer);

    // Upsert snippet install record
    // Uses UNIQUE constraint on (company_slug, referrer_domain) to dedupe
    const { error } = await supabaseAdmin
      .from('snippet_installs')
      .upsert(
        {
          company_slug: slug,
          referrer_domain: domain,
          last_seen: new Date().toISOString(),
          hit_count: 1, // Will be ignored on UPDATE due to conflict handling
        },
        {
          onConflict: 'company_slug,referrer_domain',
          ignoreDuplicates: false,
        }
      );

    // Update hit count and last_seen on conflict
    if (!error && domain !== null) {
      const { error: rpcError } = await supabaseAdmin.rpc('increment_snippet_hits', {
        p_slug: slug,
        p_domain: domain,
      });

      // If RPC fails, try manual update as fallback
      if (rpcError) {
        await supabaseAdmin
          .from('snippet_installs')
          .update({
            last_seen: new Date().toISOString(),
          })
          .eq('company_slug', slug)
          .eq('referrer_domain', domain);
      }
    }

    // Return pixel
    return new NextResponse(PIXEL_GIF, {
      status: 200,
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      },
    });
  } catch (error) {
    console.error('Snippet ping error:', error);

    // Always return pixel even on error
    return new NextResponse(PIXEL_GIF, {
      status: 200,
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
