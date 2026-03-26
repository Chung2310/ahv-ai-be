# syntax=docker/dockerfile:1

# -------- Base --------
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# -------- Dependencies --------
FROM base AS deps
COPY package.json yarn.lock ./

RUN yarn install \
  --frozen-lockfile \
  --prefer-offline

# -------- Builder --------
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN yarn build

# -------- Production dependencies --------
FROM base AS prod-deps
COPY package.json yarn.lock ./

RUN yarn install \
  --frozen-lockfile \
  --production=true \
  --ignore-scripts \
  --prefer-offline

# -------- Runtime --------
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

RUN addgroup -S nodejs -g 1001 \
  && adduser -S appuser -u 1001 -G nodejs \
  && apk add --no-cache curl tini

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

COPY package.json ./

# Tạo thư mục logs và gán quyền cho appuser trước khi switch user
RUN mkdir -p /app/logs && chown -R appuser:nodejs /app/logs

USER appuser


ENTRYPOINT ["/sbin/tini", "--"]

CMD ["node", "dist/server.js"]