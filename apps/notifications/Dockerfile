FROM node:20-bookworm-slim AS base
RUN npm install -g pnpm@9
WORKDIR /app

FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/notifications/package.json ./apps/notifications/
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps /app/apps/notifications/node_modules ./apps/notifications/node_modules
COPY packages/shared ./packages/shared
COPY apps/notifications ./apps/notifications
COPY tsconfig.base.json ./
WORKDIR /app/packages/shared
RUN pnpm build
WORKDIR /app/apps/notifications
RUN pnpm build

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nestjs
COPY --from=builder --chown=nestjs:nodejs /app/apps/notifications/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/notifications/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/packages/shared/dist ./node_modules/@nextcommerce/shared/dist
USER nestjs
EXPOSE 3002
CMD ["node", "dist/main.js"]
