import { type NextRequest } from 'next/server';

export function validateCsrf(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true;

  const host = request.headers.get('host');
  if (!host) return false;

  try {
    const originUrl = new URL(origin);
    if (originUrl.host === host) {
      return true;
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      return false;
    }

    const appUrlHost = new URL(appUrl).host;
    return originUrl.host === appUrlHost;
  } catch {
    return false;
  }
}
