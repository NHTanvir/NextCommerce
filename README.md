# NextCommerce

[![CI](https://github.com/NHTanvir/NextCommerce/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/NHTanvir/NextCommerce/actions/workflows/ci.yml)
[![Release](https://github.com/NHTanvir/NextCommerce/actions/workflows/release.yml/badge.svg)](https://github.com/NHTanvir/NextCommerce/actions/workflows/release.yml)
[![Security](https://github.com/NHTanvir/NextCommerce/actions/workflows/security.yml/badge.svg)](https://github.com/NHTanvir/NextCommerce/actions/workflows/security.yml)

A full-stack e-commerce platform for premium footwear, built to demonstrate production-grade engineering skills.

## Stack

| Layer         | Technology                                                    |
| ------------- | ------------------------------------------------------------- |
| API           | NestJS 10, TypeScript 5 strict, TypeORM, MySQL 8              |
| Web           | Next.js 14 App Router, Redux Toolkit, RTK Query, SCSS Modules |
| Mobile        | React Native / Expo, @react-navigation                        |
| Events        | RabbitMQ (amqplib), fanout exchange                           |
| Auth          | JWT (passport-jwt) + Google OAuth 2.0                         |
| Observability | Pino structured logging, prom-client Prometheus metrics       |
| Containers    | Docker multi-stage builds (node:20-bookworm-slim)             |
| Orchestration | Kubernetes — Deployment, Service, HPA, Ingress, StatefulSet   |
| CI            | GitHub Actions — lint, type-check, test, Docker build         |

## How This Maps to Field Nation's Stack

Field Nation's JD calls for a backend engineer comfortable with **NestJS, TypeScript, MySQL, Docker, Kubernetes, and event-driven architecture**. Every requirement has a direct, runnable implementation here — not just a mention:

- **NestJS + TypeScript** — `apps/api` is a full NestJS 10 monolith with strict TS, 30+ feature modules, JWT + Google OAuth, role-based guards, ValidationPipe, custom interceptors, and 81 passing unit-test suites.
- **MySQL** — TypeORM entities with MySQL 8; migrations; `synchronize: true` in dev so `docker compose up` just works.
- **React + Redux** — `apps/web` is Next.js 14 App Router with RTK Query for all data fetching, Redux Toolkit for cart/auth/wishlist state, and React Hook Form + Zod on checkout and login forms.
- **React Native (plus)** — `apps/mobile` is a real Expo app wired to the same API, including add-to-cart with anonymous token flow.
- **Docker + Kubernetes** — multi-stage Dockerfiles for every service; full k8s manifests with HPA that scales the API 2→8 pods at 70% CPU.
- **RabbitMQ (plus)** — `apps/notifications` consumes `order.*` events via fanout exchange; the API publishes on every order state change.
- **Observability (plus)** — structured Pino logs, `GET /api/metrics` (Prometheus), `checkout_duration_seconds` histogram with a documented p95 < 500 ms SLO.
- **Redis caching** — `RedisService` wraps ioredis with a `getOrSet` helper; product list responses are cached with graceful fallback when Redis is unavailable.

## Field Nation JD Mapping

| Requirement      | Implementation                                                         |
| ---------------- | ---------------------------------------------------------------------- |
| NestJS           | `apps/api` — full NestJS 10 backend with modules, guards, interceptors |
| TypeScript / ES6 | TypeScript 5 strict across all packages, ESM syntax                    |
| MySQL            | TypeORM entities with MySQL 8, auto-sync in dev                        |
| Next.js          | `apps/web` — Next.js 14 App Router with RSC + client components        |
| Redux            | Redux Toolkit store + RTK Query + typed hooks                          |
| React Native     | `apps/mobile` — Expo app, product list + detail screens                |
| Docker           | Multi-stage Dockerfiles for api, web, notifications                    |
| Kubernetes       | Full k8s manifests with HPA autoscaling                                |
| RabbitMQ         | Event-driven notifications via fanout exchange                         |
| Prometheus       | `MetricsService` — checkout SLI histogram, `GET /api/metrics`          |
| JWT              | `JwtStrategy` + `JwtAuthGuard`                                         |
| Google OAuth     | `GoogleStrategy` via passport-google-oauth20                           |

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Client Layer                     │
│  Next.js 14 (web)          React Native (mobile)   │
│  Redux + RTK Query          fetchProducts/fetch     │
└────────────────────┬────────────────────────────────┘
                     │ HTTP / REST
┌────────────────────▼────────────────────────────────┐
│                  API (NestJS 10)                    │
│  Auth · Catalog · Cart · Orders · Reviews           │
│  JWT Guard · Roles Guard · ValidationPipe           │
│  Pino Logger · Prometheus /metrics · Health checks  │
└──────┬──────────────────────────────┬───────────────┘
       │ TypeORM                      │ amqplib
┌──────▼──────┐               ┌───────▼──────────────┐
│  MySQL 8    │               │  RabbitMQ 3.13        │
│  (TypeORM)  │               │  nextcommerce.events  │
└─────────────┘               └───────┬───────────────┘
                                      │ consume
                              ┌───────▼───────────────┐
                              │  Notifications (NestJS)│
                              │  email simulation      │
                              └───────────────────────┘
```

## Quick Start

```bash
# Prerequisites: Docker, pnpm 9+
cp .env.example .env

# Start all services
docker compose up -d

# Seed demo products
API_URL=http://localhost:3001 npx ts-node infra/seed/seed.ts

# Open
# Web:  http://localhost:3000
# API:  http://localhost:3001/api/docs  (Swagger)
# MQ:   http://localhost:15672  (guest/guest)
```

## Development

```bash
pnpm install
pnpm --filter @nextcommerce/shared build

# API
pnpm --filter @nextcommerce/api dev

# Web
pnpm --filter @nextcommerce/web dev

# Notifications
pnpm --filter @nextcommerce/notifications dev
```

## Environment Variables

See `.env.example` for all required variables.

| Variable               | Description                  |
| ---------------------- | ---------------------------- |
| `DATABASE_URL`         | MySQL connection string      |
| `RABBITMQ_URL`         | RabbitMQ AMQP URL            |
| `JWT_SECRET`           | Secret for signing JWTs      |
| `GOOGLE_CLIENT_ID`     | Google OAuth client ID       |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret   |
| `NEXT_PUBLIC_API_URL`  | API base URL for the web app |

## Testing

```bash
# All tests
pnpm test

# Shared package (order state machine)
pnpm --filter @nextcommerce/shared test

# Web (cart slice)
pnpm --filter @nextcommerce/web test

# API (auth service, order transitions)
pnpm --filter @nextcommerce/api test
```

## Kubernetes Deploy

```bash
kubectl apply -f infra/k8s/namespace.yaml
kubectl apply -f infra/k8s/
```

## Deploying to EKS

A condensed walkthrough for getting the stack onto Amazon EKS — the same path you'd take in a real AWS environment.

### Prerequisites

```bash
# AWS CLI v2 + eksctl + kubectl + helm
aws configure           # IAM user with EKS + ECR permissions
eksctl version          # ≥ 0.170
```

### 1 — Create the cluster

```bash
eksctl create cluster \
  --name nextcommerce \
  --region ap-southeast-1 \
  --nodegroup-name standard \
  --node-type t3.medium \
  --nodes 2 --nodes-min 2 --nodes-max 6 \
  --managed
```

This provisions a VPC with public + private subnets, an OIDC provider (needed for IRSA), and a managed node group.

### 2 — Push images to ECR

```bash
AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
REGION=ap-southeast-1
REPO_PREFIX=$AWS_ACCOUNT.dkr.ecr.$REGION.amazonaws.com/nextcommerce

aws ecr create-repository --repository-name nextcommerce/api    --region $REGION
aws ecr create-repository --repository-name nextcommerce/web    --region $REGION

aws ecr get-login-password --region $REGION \
  | docker login --username AWS --password-stdin $AWS_ACCOUNT.dkr.ecr.$REGION.amazonaws.com

docker build -t $REPO_PREFIX/api:latest apps/api
docker build -t $REPO_PREFIX/web:latest apps/web
docker push $REPO_PREFIX/api:latest
docker push $REPO_PREFIX/web:latest
```

Update `image:` in `infra/k8s/api-deployment.yaml` and `infra/k8s/web-deployment.yaml` to the ECR URIs above.

### 3 — Apply manifests

```bash
kubectl apply -f infra/k8s/namespace.yaml
kubectl apply -f infra/k8s/secrets.yaml      # populate DATABASE_URL, RABBITMQ_URL, JWT_SECRET first
kubectl apply -f infra/k8s/configmap.yaml
kubectl apply -f infra/k8s/                  # remaining manifests (Deployments, Services, HPA, Ingress)
```

### 4 — Install the AWS Load Balancer Controller (Ingress)

```bash
helm repo add eks https://aws.github.io/eks-charts
helm repo update
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=nextcommerce \
  --set serviceAccountName=aws-load-balancer-controller
```

The `infra/k8s/ingress.yaml` uses `kubernetes.io/ingress.class: alb` and creates an Internet-facing ALB that routes `/api/*` to the api Service and `/*` to the web Service.

### 5 — Verify

```bash
kubectl get pods -n nextcommerce          # all Running
kubectl get ingress -n nextcommerce       # ADDRESS column shows the ALB DNS name
curl http://<ALB_DNS>/api/health/live     # {"status":"ok"}
```

HPA (`infra/k8s/api-hpa.yaml`) scales the API from 2 → 8 pods at 70 % CPU; test it with a load generator:

```bash
kubectl run -it --rm load --image=busybox --restart=Never -- \
  sh -c "while true; do wget -q -O- http://api:3001/api/products; done"
kubectl get hpa -n nextcommerce -w
```

## Observability & SLOs

| Signal             | Implementation                                                 | Location                     |
| ------------------ | -------------------------------------------------------------- | ---------------------------- |
| Structured logs    | Pino + pino-http, JSON in prod, pretty in dev                  | `nestjs-pino` in `AppModule` |
| Request tracing    | `x-request-id` header propagated through all services          | `LoggerModule` config        |
| Health checks      | `/api/health/live` + `/api/health/ready`                       | `apps/api/src/health/`       |
| Prometheus metrics | `GET /api/metrics` — counters, histograms, gauges              | `apps/api/src/metrics/`      |
| Checkout SLI       | `checkout_duration_seconds` histogram, labels: `status`        | `MetricsService`             |
| Redis caching      | Product list cache via `RedisService`; graceful no-op fallback | `apps/api/src/redis/`        |

**SLO targets** (documented, not enforced — no live Prometheus scrape in this demo):

| Metric                  | SLO                          |
| ----------------------- | ---------------------------- |
| p95 checkout latency    | < 500 ms                     |
| API error rate (5xx)    | < 0.1% over 30-minute window |
| Cart merge success rate | > 99.9%                      |

## Key Features

- **Anonymous cart** — cart works without login; merges into user cart on authentication
- **Order state machine** — `ORDER_STATUS_TRANSITIONS` in shared package enforces valid status flow
- **Google OAuth** — one-click sign-in issues the same JWT as email/password login
- **Redis caching** — product list responses cached via `RedisService`; falls back gracefully when Redis is unavailable
- **Dark theme** — SCSS design tokens, accent `#e94560`, glassmorphism Navbar
- **Admin panel** — role-gated dashboard with order status management
- **HPA** — Kubernetes autoscaler scales API 2→8 pods at 70% CPU
