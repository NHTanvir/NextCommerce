FROM node:20-bookworm-slim AS base
RUN npm install -g pnpm
WORKDIR /app

FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/
RUN pnpm install --frozen-lockfile --ignore-scripts

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api
COPY tsconfig.base.json .eslintrc.js ./
RUN pnpm --filter @nextcommerce/shared build
RUN pnpm --filter @nextcommerce/api build

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/node_modules ./node_modules
EXPOSE 3001
HEALTHCHECK --interval=10s --timeout=5s CMD wget -qO- http://localhost:3001/api/health/live || exit 1
CMD ["node", "dist/main"]
