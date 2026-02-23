/**
 * @module app/api/employer-facts/download/llms-txt/route
 * Download llms.txt file
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateAEOContent } from '@/lib/aeo/generate';
import type { EmployerFacts } from '@/features/facts/types/employer-facts.types';

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

    // Fetch published employer facts
    const supabase = await createClient();
    const { data: facts, error } = await supabase
      .from('employer_facts')
      .select('*')
      .eq('company_slug', companySlug)
      .eq('published', true)
      .single();

    if (error || !facts) {
      return NextResponse.json(
        { error: 'Published employer facts not found' },
        { status: 404 }
      );
    }

    // Generate content
    const { llmsTxt } = generateAEOContent(facts as EmployerFacts);

    // Return as downloadable text file
    return new NextResponse(llmsTxt, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="${companySlug}-llms.txt"`,
      },
    });
  } catch (error: any) {
    console.error('Error generating llms.txt:', error);
    return NextResponse.json(
      { error: 'Failed to generate llms.txt' },
      { status: 500 }
    );
  }
}
