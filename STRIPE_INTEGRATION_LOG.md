# Stripe Integration Log

**Date:** 2025-07-22
**Status:** ✅ Complete — all files created, lint clean, tests pass

## What was built

### Dependencies
- `stripe` v20.3.1 (server-side SDK)
- `@stripe/stripe-js` (client-side Stripe.js loader)

### New files

| File | Purpose |
|------|---------|
| `src/lib/stripe/server.ts` | Server-side Stripe client (uses `STRIPE_SECRET_KEY`) |
| `src/lib/stripe/client.ts` | Client-side `loadStripe` with memoized promise |
| `src/app/api/stripe/checkout/route.ts` | POST — creates Checkout Session (Zod validated, CSRF, rate-limited 10/hr) |
| `src/app/api/stripe/webhook/route.ts` | POST — verifies signature, handles `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted` |
| `src/app/api/stripe/portal/route.ts` | POST — creates Customer Portal session (requires auth) |
| `src/components/pricing/checkout-button.tsx` | Client component: `CheckoutButton` (redirects to Stripe) + `ContactSalesButton` |
| `supabase/migrations/20260223140000_subscriptions.sql` | Subscriptions table with RLS, indexes |

### Modified files

| File | Change |
|------|--------|
| `src/app/pricing/page.tsx` | Added `CheckoutButton` for Starter/Growth tiers, `ContactSalesButton` for Scale |
| `.env.example` | Added 5 Stripe env vars |

## Architecture decisions

1. **`untypedTable()` for subscriptions** — The `subscriptions` table is new and not yet in the generated `database.types.ts`. Used the existing `untypedTable()` helper (same pattern as other untyped tables in the codebase) to avoid type errors. When types are regenerated after migration, these can be switched to typed `supabaseAdmin.from("subscriptions")`.

2. **Stripe API v2025+ period fields** — In `stripe` v20+, `current_period_start` and `current_period_end` live on `subscription.items.data[0]`, not the subscription root. Created `extractPeriod()` helper to handle this correctly.

3. **Webhook body handling** — Uses `request.text()` for raw body (required for signature verification). Exports `runtime = 'nodejs'` to ensure proper Node.js execution environment.

4. **Price-to-plan mapping** — Webhook uses env vars (`NEXT_PUBLIC_STRIPE_PRICE_VISIBILITY`, `NEXT_PUBLIC_STRIPE_PRICE_COMPLIANCE`) to map Stripe price IDs to plan names. Defaults to `'free'` for unknown prices.

5. **User lookup in webhook** — Currently uses `supabaseAdmin.auth.admin.listUsers()` to find users by email. This works for small user bases but should be replaced with a direct query or indexed lookup at scale.

## Environment variables needed

```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PRICE_VISIBILITY=price_...
NEXT_PUBLIC_STRIPE_PRICE_COMPLIANCE=price_...
```

## Verification results

| Check | Result |
|-------|--------|
| `npm run lint` | ✅ 0 errors (0 warnings from Stripe files) |
| `npm run typecheck` | ✅ 0 errors from Stripe files (2 pre-existing `email_sends` errors) |
| `npm run test` | ✅ 35/35 test files, 339/339 tests pass |

## Next steps

1. **Apply the migration** — Run `supabase db push` or `supabase migration up` to create the subscriptions table
2. **Regenerate types** — `supabase gen types typescript` to add subscriptions to `database.types.ts`, then swap `untypedTable()` calls for typed ones
3. **Set env vars** — Add Stripe keys in Vercel dashboard and `.env.local`
4. **Create Stripe products** — Create the price objects in Stripe Dashboard and copy IDs to env vars
5. **Configure webhook endpoint** — In Stripe Dashboard, point webhook to `https://openrole.co.uk/api/stripe/webhook`
6. **Test end-to-end** — Use Stripe CLI (`stripe listen --forward-to localhost:3000/api/stripe/webhook`) for local testing
