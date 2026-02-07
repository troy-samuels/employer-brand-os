"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Eye,
  FileCheck,
  ShieldCheck,
  BarChart3,
  Settings,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  correctionCount?: number;
  complianceAlerts?: number;
}

const navigationItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Your Reputation", href: "/dashboard/analytics", icon: Eye },
  { name: "Your Facts", href: "/dashboard/facts", icon: FileCheck },
  { name: "Corrections", href: "/dashboard/jobs", icon: BarChart3 },
  { name: "Compliance", href: "/dashboard/compliance", icon: ShieldCheck },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function DashboardSidebar({
  correctionCount = 3,
  complianceAlerts = 1,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="h-full px-4 py-6">
      <Link
        href="/dashboard"
        className="text-lg font-bold text-neutral-950 tracking-tight block px-3 mb-8"
      >
        BrandOS
      </Link>

      <nav className="space-y-1">
        {navigationItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          const badge =
            item.name === "Corrections" && correctionCount > 0
              ? correctionCount.toString()
              : item.name === "Compliance" && complianceAlerts > 0
                ? complianceAlerts.toString()
                : null;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150",
                isActive
                  ? "bg-brand-accent-light text-brand-accent"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
              )}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
              <span className="flex-1">{item.name}</span>
              {badge && (
                <span className="min-w-[18px] h-[18px] flex items-center justify-center bg-status-critical text-white px-1.5 text-[10px] font-semibold rounded-full">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
