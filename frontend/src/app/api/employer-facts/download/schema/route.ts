/**
 * @module app/api/employer-facts/download/schema/route
 * Download Schema.org JSON-LD file
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateAEOContent } from '@/lib/aeo/generate';
import { toAttachmentDisposition, toSafeFilenameSegment } from '@/lib/utils/http-filename';
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
    const { schemaJsonLd } = generateAEOContent(facts as EmployerFacts);
    const safeSlug = toSafeFilenameSegment(companySlug, 'employer-facts');

    // Return as downloadable JSON file
    return new NextResponse(JSON.stringify(schemaJsonLd, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/ld+json; charset=utf-8',
        'Content-Disposition': toAttachmentDisposition(`${safeSlug}-schema.jsonld`),
      },
    });
  } catch (error: unknown) {
    console.error('Error generating schema:', error);
    return NextResponse.json(
      { error: 'Failed to generate schema' },
      { status: 500 }
    );
  }
}
