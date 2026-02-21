/**
 * @module components/dashboard/header
 * Module implementation for header.tsx.
 */

"use client";

import { usePathname } from "next/navigation";

const titles: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/jobs": "Job Postings",
  "/dashboard/analytics": "Analytics",
  "/dashboard/pixel": "Pixel Status",
  "/dashboard/compliance": "Compliance",
  "/dashboard/settings": "Settings",
};

/**
 * Executes DashboardHeader.
 * @returns The resulting value.
 */
export function DashboardHeader() {
  const pathname = usePathname();
  const title = titles[pathname] || "Dashboard";

  return (
    <div className="flex items-center justify-between w-full">
      <div>
        <p className="text-xs uppercase tracking-widest text-gray-400">OpenRole</p>
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      </div>
      <div className="text-sm text-gray-500">Last updated just now</div>
    </div>
  );
}
