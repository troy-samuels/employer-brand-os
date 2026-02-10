/**
 * @module components/layouts/dashboard-layout
 * Module implementation for dashboard-layout.tsx.
 */

import { Sidebar } from './sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * Executes DashboardLayout.
 * @param param1 - param1 input.
 * @returns The resulting value.
 */
export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
