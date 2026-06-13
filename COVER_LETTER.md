# Cover Letter — Field Nation Software Engineer (Dhaka)

Hi Field Nation engineering team,

I'm applying for the Software Engineer role and want to show — not just tell — that I can work in your stack. Rather than listing skills, I built a production-shaped project that maps every bullet from the JD to a runnable commit:

**github.com/NHTanvir/NextCommerce** — a full-stack shoe-shop ecommerce platform.

---

## JD bullet → concrete commit / file

| JD requirement                   | Where it lives in the repo                                                                                     |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| NestJS / Node.js backend         | `apps/api/` — NestJS 10 monolith, 30+ feature modules, JWT guards, ValidationPipe, custom interceptors         |
| TypeScript / ES6                 | Strict TS 5 config across every package (`tsconfig.json` roots in each app)                                    |
| MySQL                            | TypeORM entities + MySQL 8; `synchronize: true` in dev so `docker compose up` just works                       |
| React + Redux                    | `apps/web/` — Next.js 14 App Router, Redux Toolkit store, RTK Query for all data fetching                      |
| React Native (plus)              | `apps/mobile/` — Expo app wired to the same API; add-to-cart with anonymous token flow                         |
| Docker + Kubernetes              | Multi-stage Dockerfiles per service; `infra/k8s/` manifests with HPA scaling 2 → 8 pods at 70 % CPU            |
| Event-Driven / RabbitMQ (plus)   | `apps/notifications/` consumes `order.*` events via fanout exchange; API publishes on every state change       |
| Observability / SLI/SLO (plus)   | `GET /api/metrics` (Prometheus), `checkout_duration_seconds` histogram, p95 < 500 ms SLO documented in README  |
| Microservice architecture (plus) | API service + notifications microservice communicate only through RabbitMQ — no direct imports                 |
| REST + OpenAPI                   | Swagger at `/api/docs`; all endpoints documented with DTOs and response schemas                                |
| SCSS / SASS (plus)               | SCSS modules with design tokens, glassmorphism Navbar, dark theme, accent `#e94560`                            |
| Testing                          | 81/81 API Jest suites (614 tests); 83 Vitest + RTL web tests; Playwright e2e for the full purchase flow        |
| Git / CI                         | Conventional Commits; GitHub Actions pipeline: lint → type-check → test → Docker build                         |
| Redis caching (plus)             | `RedisService` wraps ioredis with `getOrSet`; product list cached, graceful fallback when Redis is unavailable |

## Selected commits that tell the engineering story

```
feat(auth): JWT + Google OAuth, cart merge on login
feat(orders): checkout + order tracking with state machine
feat(events): order notifications via RabbitMQ fanout exchange
feat(observability): metrics, structured logs, SLOs
feat(catalog): add color and size filters to product query
feat(checkout): refactor address form to React Hook Form + Zod
fix(api): green test suite — 81/81 suites, 614 tests passing
feat: Redis cache module, purchase-flow e2e, Husky hook, CI shared tests
```

## Why this role

I've been writing TypeScript backends and React frontends for several years and have direct experience with the async, cross-timezone communication your JD calls out. The NestJS + MySQL + Docker + event-bus combination matches my daily tools exactly, and I'm comfortable owning a service end-to-end: schema design → REST contract → React integration → Kubernetes deployment → on-call observability.

I'd welcome the chance to walk through any part of the codebase on a call.

Best,  
NHTanvir  
n.mukto@codexpert.io
