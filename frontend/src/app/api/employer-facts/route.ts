/**
 * @module app/api/employer-facts/route
 * CRUD API for employer facts
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { employerFactsSchema } from '@/features/facts';

/**
 * GET - Fetch employer facts for the authenticated user's company
 */
export async function GET(request: NextRequest) {
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

    // Get company slug from query params or user metadata
    const searchParams = request.nextUrl.searchParams;
    const companySlug = searchParams.get('slug') || user.user_metadata?.company_slug;

    if (!companySlug) {
      return NextResponse.json(
        { error: 'Company slug not found' },
        { status: 400 }
      );
    }

    // Fetch employer facts
    const { data, error } = await supabase
      .from('employer_facts')
      .select('*')
      .eq('company_slug', companySlug)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Error fetching employer facts:', error);
      return NextResponse.json(
        { error: 'Failed to fetch employer facts' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: data || null });
  } catch (error) {
    console.error('Unexpected error in GET /api/employer-facts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST - Create or update employer facts (upsert)
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

    // Parse and validate request body
    const body = await request.json();
    const validated = employerFactsSchema.parse(body);

    // Add metadata
    const dataToSave = {
      ...validated,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    };

    // Upsert employer facts
    const { data, error } = await supabase
      .from('employer_facts')
      .upsert(dataToSave, {
        onConflict: 'company_slug',
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving employer facts:', error);
      return NextResponse.json(
        { error: 'Failed to save employer facts', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('Unexpected error in POST /api/employer-facts:', error);
    
    // Handle validation errors
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete employer facts
 */
export async function DELETE(request: NextRequest) {
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

    // Get company slug from query params
    const searchParams = request.nextUrl.searchParams;
    const companySlug = searchParams.get('slug');

    if (!companySlug) {
      return NextResponse.json(
        { error: 'Company slug is required' },
        { status: 400 }
      );
    }

    // Delete employer facts
    const { error } = await supabase
      .from('employer_facts')
      .delete()
      .eq('company_slug', companySlug)
      .eq('updated_by', user.id); // Ensure user owns the data

    if (error) {
      console.error('Error deleting employer facts:', error);
      return NextResponse.json(
        { error: 'Failed to delete employer facts' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/employer-facts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
