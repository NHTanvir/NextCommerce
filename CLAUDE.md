# NextCommerce — Claude Code Context

Portfolio shoe-shop ecommerce monorepo targeting a Field Nation Software Engineer application. Every JD requirement maps to a visible implementation in the repo.

## Stack at a glance

| Layer | Technology |
|---|---|
| Web | Next.js 14 App Router, Redux Toolkit + RTK Query, SCSS Modules |
| API | NestJS 10, TypeScript 5 strict, TypeORM, MySQL 8 |
| Mobile | React Native / Expo (product list + detail + add-to-cart) |
| Events | RabbitMQ (amqplib), fanout exchange |
| Auth | JWT (passport-jwt) + Google OAuth 2.0 |
| Observability | Pino structured logs, prom-client Prometheus metrics |
| Infra | Docker multi-stage builds, Kubernetes (Deployment/HPA/Ingress) |
| CI | GitHub Actions — lint → type-check → test → Docker build |

## Monorepo layout

```
apps/
  web/           Next.js 14 — @nextcommerce/web
  api/           NestJS 10  — @nextcommerce/api
  notifications/ NestJS microservice — @nextcommerce/notifications
  mobile/        Expo        — @nextcommerce/mobile
packages/
  shared/        Shared TS types + DTOs — @nextcommerce/shared
infra/
  k8s/           Kubernetes manifests
  seed/          products.json (30 products across 4 categories)
```

## Key commands

```bash
# Install
pnpm install

# Dev servers
pnpm --filter @nextcommerce/web dev        # http://localhost:3000
pnpm --filter @nextcommerce/api dev        # http://localhost:3001/api/docs

# Tests
pnpm --filter @nextcommerce/web test       # Vitest (83 tests, all green)
pnpm --filter @nextcommerce/api test       # Jest + Supertest
pnpm --filter @nextcommerce/shared test    # Jest (order state machine)

# E2e (requires Next.js dev server running)
pnpm --filter @nextcommerce/web e2e        # Playwright — uses page.route stubs, no live API needed

# Full stack
docker compose up -d
```

## Testing conventions

- **Web unit/component tests**: Vitest + React Testing Library (`apps/web/vitest.config.ts`)
  - Setup file: `apps/web/src/test/setup.ts` (imports `@testing-library/jest-dom/vitest`)
  - Shared helper: `apps/web/src/test/renderWithStore.tsx` — wraps UI in Redux Provider
  - Test files: `apps/web/src/__tests__/*.test.{ts,tsx}`
  - E2e directory excluded from Vitest collection via `exclude: ['**/e2e/**']`
- **Web e2e**: Playwright (`apps/web/e2e/`) — all API calls stubbed with `page.route`, no live NestJS needed
- **API tests**: Jest + Supertest (`apps/api/test/`)
- Use `vi.*` for Vitest timer fakes (not `jest.*`)

## Redux store shape

```typescript
{
  cart: { items, isOpen, anonymousToken },
  auth: { user, token, isLoading },
  wishlist: { productIds },
  compare: { productIds },
  recentlyViewed: { productIds },
  [apiSlice.reducerPath]: RTK Query cache
}
```

RTK Query base URL: `http://localhost:3001/api`

## Commit / PR conventions

- **Conventional Commits**: `feat(scope):`, `fix(scope):`, `chore(scope):`, `test(scope):`
- **Never** add `Co-Authored-By:` or AI attribution trailers
- Each feature gets its own branch → issue → PR → merge to master
- All commits backdated into the 2026 March-May window using `GIT_AUTHOR_DATE` / `GIT_COMMITTER_DATE`

## Completed PRs (master)

| PR | Branch | What |
|----|--------|------|
| #1–#40 | various | Phases 1–7: skeleton, catalog, auth, cart, orders, events, observability, reviews, admin, K8s |
| #41 | feat/notifications-tests-setup | Vitest setup + notifications SSE hook tests |
| #42 | chore/lockfile | pnpm lockfile sync |
| #44 | feat/seed-30-products | Expand seed to 30 products (4 categories, 10 brands) |
| #46 | feat/mobile-add-to-cart | Wire mobile Add-to-Cart button to `POST /api/cart/items` via AsyncStorage token |
| #48 | feat/e2e-purchase-flow | Playwright e2e: browse → add-to-cart → checkout (all API calls stubbed) |
| #50 | feat/vitest-rtl-components | Vitest config + RTL tests for ProductCard, CartDrawer, LoginForm (83 tests green) |

## Mobile cart API (`apps/mobile/src/api/cart.ts`)

Reads `auth_token`/`nc_token` and `nc_cart_token` from AsyncStorage, attaches them as Bearer and `x-cart-token` headers respectively, persists any new token issued in the response `x-cart-token` header.

## Path aliases

- Web: `@/` → `apps/web/src/`
- Shared package importable as `@nextcommerce/shared`

## Known deprecation warnings (safe to ignore)

- Sass legacy JS API warnings from SCSS module processing in tests
- `ReactDOMTestUtils.act` deprecation from `@testing-library/react` internals — harmless
