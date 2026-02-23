/**
 * @module app/dashboard/layout
 * Authenticated dashboard layout with sidebar navigation.
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export const dynamic = "force-dynamic";

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

  return (
    <DashboardShell
      userEmail={user.email ?? ""}
      plan="free"
    >
      {children}
    </DashboardShell>
  );
}
