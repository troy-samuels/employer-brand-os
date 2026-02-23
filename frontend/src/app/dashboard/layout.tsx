/**
 * @module app/dashboard/layout
 * Authenticated dashboard layout with sidebar navigation.
 * Reads the user's subscription plan from Supabase to gate features.
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { untypedTable } from "@/lib/supabase/untyped-table";
import { DashboardShell, type PlanTier } from "@/components/dashboard/dashboard-shell";

export const dynamic = "force-dynamic";

/** Resolve the user's active plan from the subscriptions table. */
async function getUserPlan(userId: string): Promise<PlanTier> {
  try {
    const { data, error } = await untypedTable("subscriptions")
      .select("plan_name, status")
      .eq("user_id", userId)
      .in("status", ["active", "trialing"])
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return "free";

    const plan = (data as { plan_name: string }).plan_name;

    // Validate against known plan names (including legacy)
    const validPlans: PlanTier[] = ["free", "pro", "enterprise", "starter", "growth", "scale", "control", "compete", "command"];
    if (validPlans.includes(plan as PlanTier)) {
      return plan as PlanTier;
    }

    return "free";
  } catch {
    // Table may not exist yet — default to free
    return "free";
  }
}

/** Get company name from user metadata or profile. */
async function getCompanyName(userId: string, userMeta: Record<string, unknown> | undefined): Promise<string | undefined> {
  // First check auth metadata (set during signup)
  if (userMeta?.company_name && typeof userMeta.company_name === "string") {
    return userMeta.company_name;
  }

  // Fallback: check profiles table
  try {
    const { data } = await untypedTable("profiles")
      .select("company_name")
      .eq("id", userId)
      .single();

    if (data && (data as { company_name: string }).company_name) {
      return (data as { company_name: string }).company_name;
    }
  } catch {
    // profiles table may not exist
  }

  return undefined;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard");
  }

  const [plan, companyName] = await Promise.all([
    getUserPlan(user.id),
    getCompanyName(user.id, user.user_metadata),
  ]);

  return (
    <DashboardShell
      userEmail={user.email ?? ""}
      plan={plan}
      companyName={companyName}
    >
      {children}
    </DashboardShell>
  );
}
