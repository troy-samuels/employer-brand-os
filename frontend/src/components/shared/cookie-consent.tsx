/**
 * @module components/shared/cookie-consent
 * Cookie consent banner for PECR compliance.
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

/**
 * Executes CookieConsent.
 * Displays a minimal cookie consent banner at the bottom of the page.
 * OpenRole only uses essential cookies (Supabase auth) — no tracking.
 * @returns The resulting value.
 */
export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted
    const hasConsent = document.cookie
      .split('; ')
      .find((row) => row.startsWith('cookie-consent='));

    if (!hasConsent) {
      setIsVisible(true);
    }
  }, []);

  /**
   * Executes handleAccept.
   * Sets consent cookie and hides banner.
   */
  const handleAccept = () => {
    // Set cookie for 1 year
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    document.cookie = `cookie-consent=accepted; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-200 bg-white shadow-elevated">
      <div className="mx-auto max-w-7xl px-6 py-4 lg:px-12">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Message */}
          <div className="flex-1">
            <p className="text-sm leading-relaxed text-neutral-600">
              We use <strong>essential cookies only</strong> to keep you signed in. No tracking,
              no analytics, no third parties.{' '}
              <Link
                href="/cookies"
                className="text-brand-accent underline underline-offset-2 hover:text-brand-accent-hover"
              >
                Learn more
              </Link>
            </p>
          </div>

          {/* Accept button */}
          <Button onClick={handleAccept} variant="primary" size="md" className="w-full sm:w-auto">
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
