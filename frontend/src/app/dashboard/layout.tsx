import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="flex">
        {/* Sidebar — hidden on mobile, icon-only on tablet, full on desktop */}
        <aside className="fixed inset-y-0 left-0 w-[240px] bg-white border-r border-neutral-200 hidden lg:block">
          <DashboardSidebar />
        </aside>

        <div className="flex-1 lg:ml-[240px]">
          <header className="h-16 bg-white border-b border-neutral-200 px-6 flex items-center justify-between sticky top-0 z-30">
            <DashboardHeader />
          </header>

          <main className="p-6 lg:p-8 max-w-[960px]">{children}</main>
        </div>
      </div>
    </div>
  );
}
