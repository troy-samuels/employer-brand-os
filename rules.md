# OpenRole Project Constitution & Coding Standards

## 1. Tech Stack & Architecture
- **Framework:** Next.js 15+ (App Router)
- **Language:** TypeScript (Strict Mode)
- **Styling:** Tailwind CSS + Shadcn UI (Mobile-first)
- **Database:** Supabase (Postgres)
- **State Management:** React Query (TanStack Query) for server state, Zustand for client state.
- **Validation:** Zod for all inputs and API schemas.

## 2. Coding Principles (The "100-Dev Standard")
- **DRY (Don't Repeat Yourself):** Extract reusable logic into hooks/utils.
- **Type Safety:** No `any` types. All props and API responses must be typed via interfaces or Zod schemas.
- **Component Structure:**
  - One component per file.
  - Logic (hooks) separated from View (JSX).
- **Error Handling:** All async operations must be wrapped in Try/Catch with user-facing Toast notifications.
- **Comments:** Code must be commented to explain *Business Logic* (Why), not just syntax (What).

## 3. Security Protocols
- **RLS (Row Level Security):** Every Supabase table must have RLS enabled.
- **Input Sanitization:** All user inputs must be parsed via Zod before processing.
- **Environment Variables:** Never hardcode secrets. Use `.env.local`.

## 4. UI/UX Standards
- **Loading States:** All data fetching must show Skeletons (Suspense) or Loading Spinners.
- **Empty States:** Tables/Lists must have specific "No Data" views with Call-to-Actions.
- **Responsiveness:** All layouts must work on Mobile (375px) and Desktop (1440px).

## 5. AI Interaction Rules
- Before writing code, outline the file structure or logic flow.
- After writing code, review it for security vulnerabilities.
- If a file is long (>200 lines), suggest refactoring into smaller sub-components.
