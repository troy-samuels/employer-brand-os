# Security Audit Fix Brief

Fix ALL of the following security issues. This codebase needs to pass a professional security audit.

## 1. Add Content-Security-Policy header (CRITICAL)

In `next.config.ts`, add a CSP header to the existing headers array:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co; frame-ancestors 'self'; base-uri 'self'; form-action 'self'
```

Note: `unsafe-inline` and `unsafe-eval` are needed for Next.js. In production you'd use nonces but that requires middleware — this is the pragmatic baseline.

## 2. Replace in-memory rate limiter with Supabase-backed one (CRITICAL)

File: `src/lib/utils/rate-limiter.ts`

The current `new Map()` rate limiter resets on every deploy. Replace with a Supabase-backed rate limiter:

- Create a new file or update the existing one
- Use `supabaseAdmin` to store rate limit buckets in a `rate_limits` table
- Schema: `id (uuid), bucket_key (text, unique), count (int), expires_at (timestamptz)`
- On check: upsert the bucket, increment count, check if over limit
- Expired buckets should be cleaned up (delete where expires_at < now)
- Fall back to in-memory if Supabase call fails (graceful degradation)
- DO NOT import supabaseAdmin at module top level — use dynamic import to avoid circular deps

Also create a migration SQL file at `migrations/001_rate_limits.sql` with:
```sql
CREATE TABLE IF NOT EXISTS rate_limits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  bucket_key text UNIQUE NOT NULL,
  count integer NOT NULL DEFAULT 1,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_rate_limits_bucket ON rate_limits (bucket_key);
CREATE INDEX idx_rate_limits_expires ON rate_limits (expires_at);
```

## 3. Fix API key validation to verify full hash (CRITICAL)

File: `src/features/pixel/lib/validate-key.ts`

Currently matches on `key_prefix` (first 16 chars) only. The SHA-256 hash stored in DB is never verified. Fix:

- After finding the key by prefix, also verify `createHash('sha256').update(fullKey).digest('hex') === pixel.key_hash`
- Need to select `key_hash` in the query
- Import `createHash` from `crypto`
- Update the function signature to accept the full key, not just prefix
- Update callers in `src/app/api/pixel/v1/facts/route.ts` and `src/app/api/pixel/v1/sanitize/route.ts` to pass the full key

## 4. Add auth middleware for dashboard routes (CRITICAL)

Create `middleware.ts` in the project root (same level as `src/`):

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const publicRoutes = ['/', '/login', '/signup', '/auth/callback', '/verify', '/how-we-score', '/demo']
const apiPublicRoutes = ['/api/health', '/api/audit', '/api/pixel', '/api/jobs', '/api/analytics']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  const isPublic = publicRoutes.some(r => pathname === r || pathname.startsWith(`${r}/`))
  const isApiPublic = apiPublicRoutes.some(r => pathname === r || pathname.startsWith(`${r}/`))
  const isStatic = pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname.includes('.')

  if (isStatic || isPublic || isApiPublic) return supabaseResponse

  if (!user && pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

## 5. Add CSRF protection to POST endpoints (IMPORTANT)

For `src/app/api/audit/route.ts` and `src/app/api/analytics/route.ts`:

- Check `Origin` header matches the app's own origin
- Reject requests where `Origin` is present but doesn't match `process.env.NEXT_PUBLIC_APP_URL` or the request's own host
- Add a helper function in `src/lib/utils/csrf.ts`:

```typescript
import { NextRequest } from 'next/server';

export function validateCsrf(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true; // Same-origin requests may not have Origin header
  
  const host = request.headers.get('host');
  if (!host) return false;
  
  try {
    const originUrl = new URL(origin);
    return originUrl.host === host;
  } catch {
    return false;
  }
}
```

Then in each POST handler, add at the top:
```typescript
if (!validateCsrf(request)) {
  return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
}
```

## 6. Add auth to unprotected API routes (IMPORTANT)

Files: `src/app/api/jobs/route.ts`, `src/app/api/analytics/route.ts`

These return data to anyone. Add auth checks:

```typescript
import { createClient } from '@/lib/supabase/server';

// At start of handler:
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

Also validate the analytics POST body with Zod schema.

## 7. Sanitise dangerouslySetInnerHTML (IMPORTANT)

File: `src/app/verify/[slug]/page.tsx`

The JSON-LD injection uses `dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}`. While `JSON.stringify` is generally safe, add explicit sanitisation:

Replace:
```tsx
dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
```

With:
```tsx
dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c').replace(/>/g, '\\u003e') }}
```

This prevents any `</script>` injection within JSON-LD content.

## Verification

After ALL changes:
1. `npx tsc --noEmit` must pass
2. `npm run build` must compile clean
3. Commit: `security: audit hardening — CSP, rate limiting, auth middleware, CSRF, key validation`
