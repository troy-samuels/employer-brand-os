/**
 * @module app/api/employer-facts/generate/route
 * Generate AEO content from employer facts
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateAEOContent } from '@/lib/aeo/generate';
import type { EmployerFacts } from '@/features/facts/types/employer-facts.types';

/**
 * POST - Generate AEO content formats from employer facts
 * Body: { company_slug: string }
 * Returns: { llmsTxt, schemaJsonLd, markdownPage, factPageHtml }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { company_slug } = body;

    if (!company_slug) {
      return NextResponse.json(
        { error: 'company_slug is required' },
        { status: 400 }
      );
    }

    // Fetch employer facts
    const { data: facts, error: fetchError } = await supabase
      .from('employer_facts')
      .select('*')
      .eq('company_slug', company_slug)
      .eq('published', true) // Only generate for published facts
      .single();

    if (fetchError || !facts) {
      return NextResponse.json(
        { error: 'Employer facts not found or not published' },
        { status: 404 }
      );
    }

    // Generate AEO content
    const aeoContent = generateAEOContent(facts as EmployerFacts);

    return NextResponse.json({
      success: true,
      data: aeoContent,
      meta: {
        company_name: facts.company_name,
        company_slug: facts.company_slug,
        last_updated: facts.updated_at,
      },
    });
  } catch (error: any) {
    console.error('Error generating AEO content:', error);
    return NextResponse.json(
      { error: 'Failed to generate AEO content', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET - Generate AEO content for a specific company (public endpoint for published facts)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companySlug = searchParams.get('slug');

    if (!companySlug) {
      return NextResponse.json(
        { error: 'slug parameter is required' },
        { status: 400 }
      );
    }

    // Fetch published employer facts (no auth required for published data)
    const supabase = await createClient();
    const { data: facts, error: fetchError } = await supabase
      .from('employer_facts')
      .select('*')
      .eq('company_slug', companySlug)
      .eq('published', true)
      .single();

    if (fetchError || !facts) {
      return NextResponse.json(
        { error: 'Published employer facts not found' },
        { status: 404 }
      );
    }

    // Generate AEO content
    const aeoContent = generateAEOContent(facts as EmployerFacts);

    return NextResponse.json({
      success: true,
      data: aeoContent,
      meta: {
        company_name: facts.company_name,
        company_slug: facts.company_slug,
        last_updated: facts.updated_at,
      },
    });
  } catch (error: any) {
    console.error('Error generating AEO content:', error);
    return NextResponse.json(
      { error: 'Failed to generate AEO content', details: error.message },
      { status: 500 }
    );
  }
}
