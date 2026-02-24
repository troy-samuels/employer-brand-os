/**
 * @module components/dashboard/dashboard-shell
 * Client shell for the dashboard with sidebar and main content area.
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Brain,
  ShieldCheck,
  BarChart3,
  FileCheck,
  Briefcase,
  Code2,
  Plug,
  Settings,
  LogOut,
  ArrowUpRight,
  Menu,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

/**
 * OpenRole plan tiers:
 *   free        — audit + basic tools, no paid features
 *   pro         — full solution: monitoring, playbook, competitors, brand defence
 *   enterprise  — everything + API, SSO, dedicated CSM
 */
export type PlanTier = "free" | "pro" | "enterprise" | "starter" | "growth" | "scale" | "control" | "compete" | "command";

interface DashboardShellProps {
  children: React.ReactNode;
  userEmail: string;
  plan: PlanTier;
  companyName?: string;
}

/** Feature gates per plan — true = accessible */
const PLAN_FEATURES: Record<PlanTier, Set<string>> = {
  free: new Set(["/dashboard", "/dashboard/settings"]),
  pro: new Set([
    "/dashboard",
    "/dashboard/analytics",
    "/dashboard/compliance",
    "/dashboard/sanitization",
    "/dashboard/facts",
    "/dashboard/jobs",
    "/dashboard/integration",
    "/dashboard/settings",
  ]),
  enterprise: new Set([
    "/dashboard",
    "/dashboard/analytics",
    "/dashboard/compliance",
    "/dashboard/sanitization",
    "/dashboard/facts",
    "/dashboard/jobs",
    "/dashboard/pixel",
    "/dashboard/integration",
    "/dashboard/settings",
  ]),
  // Legacy plan names (for backward compatibility)
  starter: new Set([
    "/dashboard",
    "/dashboard/analytics",
    "/dashboard/settings",
  ]),
  growth: new Set([
    "/dashboard",
    "/dashboard/analytics",
    "/dashboard/compliance",
    "/dashboard/sanitization",
    "/dashboard/facts",
    "/dashboard/jobs",
    "/dashboard/settings",
  ]),
  scale: new Set([
    "/dashboard",
    "/dashboard/analytics",
    "/dashboard/compliance",
    "/dashboard/sanitization",
    "/dashboard/facts",
    "/dashboard/jobs",
    "/dashboard/pixel",
    "/dashboard/integration",
    "/dashboard/settings",
  ]),
  // New tier names (control / compete / command)
  control: new Set([
    "/dashboard",
    "/dashboard/analytics",
    "/dashboard/facts",
    "/dashboard/settings",
  ]),
  compete: new Set([
    "/dashboard",
    "/dashboard/analytics",
    "/dashboard/compliance",
    "/dashboard/sanitization",
    "/dashboard/facts",
    "/dashboard/jobs",
    "/dashboard/settings",
  ]),
  command: new Set([
    "/dashboard",
    "/dashboard/analytics",
    "/dashboard/compliance",
    "/dashboard/sanitization",
    "/dashboard/facts",
    "/dashboard/jobs",
    "/dashboard/pixel",
    "/dashboard/integration",
    "/dashboard/settings",
  ]),
};

interface NavItem {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
  /** Minimum plan required — items below user's plan show as locked */
  minPlan: PlanTier;
}

const PLAN_ORDER: PlanTier[] = ["free", "starter", "control", "growth", "compete", "pro", "scale", "command", "enterprise"];

function planIndex(p: PlanTier): number {
  return PLAN_ORDER.indexOf(p);
}

const navigationItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, minPlan: "free" },
  { name: "Brand Defence", href: "/dashboard/analytics", icon: Brain, minPlan: "control" },
  { name: "Compliance", href: "/dashboard/compliance", icon: ShieldCheck, minPlan: "compete" },
  { name: "Content Playbook", href: "/dashboard/sanitization", icon: BarChart3, minPlan: "compete" },
  { name: "Facts", href: "/dashboard/facts", icon: FileCheck, minPlan: "control" },
  { name: "Jobs", href: "/dashboard/jobs", icon: Briefcase, minPlan: "compete" },
  { name: "Integration", href: "/dashboard/integration", icon: Plug, minPlan: "command" },
  { name: "Pixel", href: "/dashboard/pixel", icon: Code2, minPlan: "command" },
  { name: "Settings", href: "/dashboard/settings", icon: Settings, minPlan: "free" },
];

const planBadge: Record<string, { label: string; className: string }> = {
  free: {
    label: "Free",
    className: "bg-slate-100 text-slate-600",
  },
  pro: {
    label: "Pro",
    className: "bg-teal-50 text-teal-700",
  },
  enterprise: {
    label: "Enterprise",
    className: "bg-amber-50 text-amber-700",
  },
  // Legacy plan names (for backward compatibility)
  starter: {
    label: "Starter",
    className: "bg-blue-50 text-blue-700",
  },
  growth: {
    label: "Growth",
    className: "bg-teal-50 text-teal-700",
  },
  scale: {
    label: "Scale",
    className: "bg-violet-50 text-violet-700",
  },
  // New tier names
  control: {
    label: "Control",
    className: "bg-teal-50 text-teal-700",
  },
  compete: {
    label: "Compete+",
    className: "bg-violet-50 text-violet-700",
  },
  command: {
    label: "Command",
    className: "bg-amber-50 text-amber-700",
  },
};

export function DashboardShell({
  children,
  userEmail,
  plan,
  companyName,
}: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const badge = planBadge[plan] ?? planBadge.free;
  const userPlanIndex = planIndex(plan);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="px-4 py-6">
        <Link
          href="/dashboard"
          className="text-lg font-bold text-slate-900 tracking-tight block px-3"
        >
          OpenRole
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-4 overflow-y-auto">
        {navigationItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          const locked = planIndex(item.minPlan) > userPlanIndex;

          if (locked) {
            return (
              <div
                key={item.name}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 cursor-not-allowed"
                title={`Requires ${item.minPlan.charAt(0).toUpperCase() + item.minPlan.slice(1)} plan`}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
                <span className="flex-1">{item.name}</span>
                <span className="text-[10px] font-semibold text-slate-300 bg-slate-100 rounded px-1.5 py-0.5">
                  {item.minPlan.charAt(0).toUpperCase() + item.minPlan.slice(1)}
                </span>
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150",
                isActive
                  ? "bg-teal-50 text-teal-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
              <span className="flex-1">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-200 px-4 py-4 space-y-3">
        {/* Upgrade CTA — shown for free plan */}
        {plan === "free" && (
          <Link
            href="/pricing"
            className="flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors duration-200"
          >
            Upgrade to Pro
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        )}

        {/* User info */}
        <div className="flex items-center gap-3 px-1">
          <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 uppercase shrink-0">
            {userEmail.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              {userEmail}
            </p>
            <span
              className={cn(
                "inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded",
                badge.className
              )}
            >
              {badge.label}
            </span>
          </div>
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors duration-150"
        >
          <LogOut className="h-[18px] w-[18px]" strokeWidth={1.5} />
          Log out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile header */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <Link
          href="/dashboard"
          className="text-lg font-bold text-slate-900 tracking-tight"
        >
          OpenRole
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition-colors duration-200"
          aria-label={mobileOpen ? "Close sidebar" : "Open sidebar"}
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
            onKeyDown={() => setMobileOpen(false)}
            role="button"
            tabIndex={-1}
            aria-label="Close sidebar"
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 lg:hidden">
            {sidebar}
          </aside>
        </>
      )}

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r border-slate-200 bg-white">
          {sidebar}
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:pl-64">
          <div className="mx-auto max-w-5xl px-6 py-8 lg:px-10 lg:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
