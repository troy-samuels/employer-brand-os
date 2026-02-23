# OpenRole Frontend

Production Next.js app for OpenRole's public site, audit engine, dashboard, and API routes.

## Requirements

- Node.js 20.11+ (Node 20 LTS recommended)
- npm 10+

## Local Setup

1. Copy environment template:

```bash
cp .env.example .env.local
```

2. Fill `.env.local` with real values from your secret manager.

3. Install and run:

```bash
npm install
npm run dev
```

App runs at `http://localhost:3000`.

## Commands

- `npm run dev` start local dev server
- `npm run lint` run ESLint
- `npm run typecheck` run TypeScript checks
- `npm run test` run Vitest suite
- `npm run build` production build
- `npm run check` full release gate (`lint + typecheck + tests + build`)

## Production Release Gate

Run before deploy:

```bash
npm run check
npm audit --omit=dev
```

## Environment Variables

- `NEXT_PUBLIC_APP_URL` public app URL for metadata/callbacks
- `NEXT_PUBLIC_SUPABASE_URL` Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` public anon key
- `SUPABASE_SERVICE_ROLE_KEY` server-side Supabase key
- `CRON_SECRET` auth for scheduled monitor endpoint
- `SCRAPINGBEE_API_KEY` optional fallback renderer for bot-protected pages
- `SERPER_API_KEY` optional search provider key
- `BRAVE_SEARCH_API_KEY` optional search provider key

## Key Directories

- `src/app` App Router pages + API routes
- `src/components` UI and feature components
- `src/lib` audit engine, security, utilities, Supabase clients
- `src/features` domain modules (`pixel`, `facts`, `sanitization`)
- `src/__tests__` unit and integration tests
- `public` static assets, logos, pixel scripts

## Security Notes

- Request hardening and auth/session enforcement live in `src/proxy.ts`.
- CSP is nonce-based and set in proxy, not in `next.config.ts`.
- Never commit `.env.local` or real credentials.
