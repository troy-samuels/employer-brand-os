import { PixelStatus } from "@/components/dashboard/pixel-status";
import { Card } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Overline */}
      <div>
        <p className="overline mb-2">Dashboard</p>
        <h1 className="text-2xl font-bold text-neutral-950 tracking-tight">
          Your AI Reputation
        </h1>
      </div>

      {/* Key metrics — the 3 numbers that matter */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card variant="bordered" padding="md">
          <p className="overline mb-2">Shadow Salary Gap</p>
          <p className="text-3xl font-bold text-neutral-950">£18,200</p>
          <p className="text-sm text-neutral-500 mt-1">
            Average difference between AI estimates and your verified ranges
          </p>
        </Card>
        <Card variant="bordered" padding="md">
          <p className="overline mb-2">AI Corrections This Week</p>
          <p className="text-3xl font-bold text-neutral-950">14</p>
          <p className="text-sm text-neutral-500 mt-1">
            Times BrandOS data overrode outdated or inaccurate sources
          </p>
        </Card>
        <Card variant="bordered" padding="md">
          <p className="overline mb-2">Compliance Status</p>
          <p className="text-3xl font-bold text-status-verified">Compliant</p>
          <p className="text-sm text-neutral-500 mt-1">
            All active roles meet pay transparency requirements
          </p>
        </Card>
      </div>

      {/* Pixel health — minimised, not a top-level focus */}
      <PixelStatus
        status="active"
        lastSeen="2 minutes ago"
        schemaVersion="v1.0"
        jobsInjected={48}
      />

      {/* Next actions — written for HR, not developers */}
      <Card variant="bordered" padding="lg">
        <h3 className="text-base font-semibold text-neutral-950 mb-4">
          Recommended next steps
        </h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-3 text-sm">
            <span className="mt-0.5 w-5 h-5 rounded-full bg-status-warning-light text-status-warning flex items-center justify-center text-xs font-bold shrink-0">!</span>
            <div>
              <p className="text-neutral-950 font-medium">2 roles missing salary data for New York</p>
              <p className="text-neutral-500">NYC Local Law 144 requires salary ranges on all postings</p>
            </div>
          </li>
          <li className="flex items-start gap-3 text-sm">
            <span className="mt-0.5 w-5 h-5 rounded-full bg-brand-accent-light text-brand-accent flex items-center justify-center text-xs font-bold shrink-0">→</span>
            <div>
              <p className="text-neutral-950 font-medium">Add your benefits package</p>
              <p className="text-neutral-500">AI currently has no benefits data for your company — candidates only see salary</p>
            </div>
          </li>
          <li className="flex items-start gap-3 text-sm">
            <span className="mt-0.5 w-5 h-5 rounded-full bg-brand-accent-light text-brand-accent flex items-center justify-center text-xs font-bold shrink-0">→</span>
            <div>
              <p className="text-neutral-950 font-medium">Review your Monday Report</p>
              <p className="text-neutral-500">Your latest weekly report is ready — 3 new AI corrections since last Monday</p>
            </div>
          </li>
        </ul>
      </Card>
    </div>
  );
}
