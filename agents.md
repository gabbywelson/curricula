# Project Context & Memory

## Tech Stack

- **Framework:** Next.js 15+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** NeonDB (PostgreSQL)
- **ORM:** Drizzle ORM
- **Authentication:** Better Auth
- **Analytics:** PostHog
- **Environment:** T3 Env
- **Package Manager:** pnpm

## Implementation Patterns

### Analytics
We use PostHog for client-side analytics.
- **Import:** `import posthog from 'posthog-js'`
- **Usage:**
  ```typescript
  onClick={() => posthog.capture('event_name', { property: 'value' })}
  ```
- **Pattern:** Wrap `posthog.capture` in event handlers or `useEffect` for page views (handled automatically by PostHog provider usually, but custom events need manual capture).

### Database
- **Schema:** Located in `src/db/schema.ts`.
- **Client:** Exported from `src/db/index.ts`.
- **Conventions:**
  - Use `drizzle-kit` for migrations.
  - Tables are defined using `pgTable`.
  - Relations are defined using `relations`.

### Authentication
- **Library:** Better Auth.
- **Client:** `authClient` from `@/lib/auth-client`.
- **Server:** `auth` from `@/lib/auth` (likely `headers` based implementation).
- **User Role:** Stored in `user.role` ('admin' | 'user').

### Environment Variables
- Managed by `@t3-oss/env-nextjs`.
- Defined in `src/env.ts`.
- Usage: `import { env } from "@/env";`

## Common Commands

- `pnpm dev`: Start development server.
- `pnpm build`: Build for production.
- `pnpm start`: Start production server.
- `pnpm lint`: Run linter (Biome).
- `pnpm format`: Run formatter.
- `pnpm db:generate`: Generate SQL migrations from schema.
- `pnpm db:migrate`: Apply migrations.
- `pnpm db:push`: Push schema changes directly to DB (prototyping).
- `pnpm db:studio`: Open Drizzle Studio.

## Key Directories
- `src/app`: Next.js App Router pages and layouts.
- `src/components`: Reusable UI components.
- `src/db`: Database schema, client, and seed scripts.
- `src/lib`: Utility functions and shared logic.


