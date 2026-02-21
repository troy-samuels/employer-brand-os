/**
 * @module components/layouts/sidebar
 * Module implementation for sidebar.tsx.
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { LogOut, Settings, User as UserIcon, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navigation = [
  {
    section: 'PLATFORM',
    items: [
      { name: 'Company Facts', href: '/dashboard/facts' },
      { name: 'Sanitization', href: '/dashboard/sanitization' },
      { name: 'Team', href: '/dashboard/team' },
    ],
  },
  {
    section: 'DEVELOPER',
    items: [
      { name: 'Integration', href: '/dashboard/integration' },
      { name: 'Analytics', href: '/dashboard/analytics' },
    ],
  },
];

/**
 * Executes Sidebar.
 * @returns The resulting value.
 */
export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const userInitials = user?.user_metadata?.full_name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || user?.email?.[0].toUpperCase() || '?';

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email || '';

  return (
    <aside className="flex h-full w-56 flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo - minimal typographic */}
      <div className="px-6 py-6">
        <Link href="/dashboard">
          <span className="text-base font-semibold tracking-tight text-sidebar-primary">
            OpenRole
          </span>
        </Link>
      </div>

      {/* Navigation - Swiss typographic style */}
      <nav className="flex-1 px-6 space-y-8">
        {navigation.map((group) => (
          <div key={group.section}>
            <h3 className="text-[10px] uppercase tracking-widest text-gray-500 font-medium mb-3">
              {group.section}
            </h3>
            <div className="space-y-4">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'relative flex items-center pl-4 text-sm font-medium transition-colors',
                      isActive
                        ? 'text-sidebar-primary'
                        : 'text-sidebar-foreground hover:text-sidebar-primary'
                    )}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-sidebar-primary" />
                    )}
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer - User profile dropdown */}
      <div className="px-4 py-4 border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-sidebar-accent transition-colors outline-none">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground text-xs font-medium">
              {userInitials}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium text-sidebar-primary truncate">{userName}</p>
              <p className="text-[10px] text-gray-500 truncate">{userEmail}</p>
            </div>
            <ChevronUp className="h-4 w-4 text-gray-500" />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <UserIcon className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
