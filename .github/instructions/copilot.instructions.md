---
applyTo: "**"
---

# 🏗️ Abdul-Hafiz’s Architectural Playbook

**Version 1.0 — Designed for Next.js 15+ (App Router)**

_A practical guide for all Abdul-Hafiz SaaS & web projects._

---

## 🌟 Core Principles

1️⃣ **Keep It Simple, Clean & Maintainable**

- Prioritize readability over clever tricks.
- Structure code for clarity: split responsibilities clearly.
- Document **why**, not just **how**.
- Leave TODOs only with clear context.

2️⃣ **React & Next.js Best Practices**

- Use **Server Components** for data fetching where practical.
- Use **Client Components** only for true interactivity/state.
- Keep UI pure: no direct DOM hacking.
- Favor co-location: related files live together (`route.ts`, `page.tsx`, `layout.tsx`).
- Use `app` router conventions: folder structure = routes.

3️⃣ **Single Source of Truth**

- Keep data logic (fetching, mutations) in the backend (`route.ts` handlers, server actions).
- UI components **never** modify state directly on the server — they dispatch actions or mutate via API routes.
- Use local state only for ephemeral UI needs (e.g., toggles).

4️⃣ **No Hacky Fixes**

- Don’t sidestep Next.js conventions with ad-hoc workarounds.
- Avoid random client-side fetching for server-side data.
- Use official solutions: NextAuth for auth, `cookies()`/`headers()` for secure context.
- No global variables that bypass props or context.

5️⃣ **Change Management**

- Test routes and actions thoroughly.
- Check the effect of changes on caching (e.g., using `revalidate`).
- Write clear PRs: what, why, and how to test.

6️⃣ **Event-Action When Needed**

- For simple CRUD, direct API calls are fine.
- For real-time or complex flows, use `actions` + `events` to decouple logic.
- Use clear naming: `createSubscription`, `cancelSubscription`, `sendReminder`.

---

## 🗂️ Folder & Structure Conventions

- `app/` — Route folders with `page.tsx`, `layout.tsx`, `loading.tsx` as needed.
- `app/api/` — API route handlers (`route.ts`).
- `lib/` — Shared server logic (db clients, helpers).
- `components/` — Client-side React components only.
- `hooks/` — Custom hooks for shared state logic.
- `schemas/` — Zod or validation schemas.
- `types/` — Shared TypeScript types.

---

## ⚙️ When to Refactor

- Logic leaks into multiple places.
- You repeat workarounds in more than 1 feature.
- A new feature doesn’t fit the current structure naturally.
- Client code is doing server work.

---

## ✅ Core Tech Stack

- **Next.js 15+ (App Router)**
- **Tailwind CSS** for design consistency.
- **Prisma** or Supabase Client for DB.
- **NextAuth.js** for authentication.
- **API Routes** (`route.ts`) + Server Actions for mutations.
- **Official APIs** for WhatsApp/SMS/Email.
- **Vercel** for deployment.

---

## ⚡ Decision Rule

**"Simple first, scale when necessary."**

If it’s CRUD, keep it direct.

If it’s complex (multi-user real-time, event chains), design event-action flows.

Always keep backend logic out of the client.

---

## ✅ Core Dev Tools

- ESLint & Prettier: enforced by default.
- Husky/commitlint for PR hygiene (optional).
