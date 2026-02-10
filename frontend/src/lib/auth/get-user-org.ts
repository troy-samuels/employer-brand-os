/**
 * @module lib/auth/get-user-org
 * Module implementation for get-user-org.ts.
 */

import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

/**
 * Defines the UserOrganization contract.
 */
export interface UserOrganization {
  userId: string
  organizationId: string
  organizationName: string
  userRole: string
}

/**
 * Get the current authenticated user and their organization.
 * If the user doesn't have an organization yet (new signup), creates one.
 *
 * @returns User and organization details, or null if not authenticated
 */
export async function getUserOrganization(): Promise<UserOrganization | null> {
  const supabase = await createClient()

  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return null
  }

  // Check if user already exists in our users table with an organization
  const { data: existingUser } = await supabaseAdmin
    .from('users')
    .select('id, organization_id, role, organizations(id, name)')
    .eq('auth_id', user.id)
    .single()

  if (existingUser?.organization_id) {
    const org = existingUser.organizations as { id: string; name: string } | null
    return {
      userId: existingUser.id,
      organizationId: existingUser.organization_id,
      organizationName: org?.name || '',
      userRole: existingUser.role,
    }
  }

  // New user - create organization and user record
  const userMetadata = user.user_metadata || {}
  const companyName = userMetadata.company_name || 'My Company'
  const fullName = userMetadata.full_name || user.email?.split('@')[0] || 'User'

  // Generate a URL-friendly slug from company name
  const baseSlug = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  const slug = `${baseSlug}-${Date.now().toString(36)}`

  // Create organization
  const { data: newOrg, error: orgError } = await supabaseAdmin
    .from('organizations')
    .insert({
      name: companyName,
      slug,
      tier: 'verify', // Start with basic tier
      trust_score: 0,
      settings: {},
    })
    .select('id, name')
    .single()

  if (orgError || !newOrg) {
    console.error('Error creating organization:', orgError)
    return null
  }

  // Create user record linked to organization
  const { data: newUser, error: userError } = await supabaseAdmin
    .from('users')
    .insert({
      auth_id: user.id,
      organization_id: newOrg.id,
      email: user.email!,
      full_name: fullName,
      role: 'admin', // First user is admin
      is_active: true,
    })
    .select('id, role')
    .single()

  if (userError || !newUser) {
    console.error('Error creating user:', userError)
    return null
  }

  return {
    userId: newUser.id,
    organizationId: newOrg.id,
    organizationName: newOrg.name,
    userRole: newUser.role,
  }
}

/**
 * Check if user has permission for an action
 */
export function hasPermission(
  userRole: string,
  action: 'view' | 'edit' | 'verify' | 'admin'
): boolean {
  const rolePermissions: Record<string, string[]> = {
    admin: ['view', 'edit', 'verify', 'admin'],
    hr_manager: ['view', 'edit', 'verify'],
    location_manager: ['view', 'edit'],
    viewer: ['view'],
  }

  const permissions = rolePermissions[userRole] || []
  return permissions.includes(action)
}
