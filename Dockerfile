# Stage 1: Dependencies
FROM node:20-slim AS deps
WORKDIR /app

# Install dependencies needed for native modules
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Create corepack cache directory with proper permissions
RUN mkdir -p /root/.cache/node/corepack && \
    chmod -R 777 /root/.cache

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY pnpm-lock.yaml package.json ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:20-slim AS builder
WORKDIR /app

# Create corepack cache directory with proper permissions
RUN mkdir -p /root/.cache/node/corepack && \
    chmod -R 777 /root/.cache

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_PUBLIC_APP_URL=https://meet.promethus-platform.io
ENV NEXT_PUBLIC_LIVEKIT_URL=wss://livekit.prometheus-platform.io

# Build the application
RUN pnpm build

# Stage 3: Runner
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOME=/app

# Create corepack cache directory with proper permissions
RUN mkdir -p /app/.cache/node/corepack && \
    chmod -R 777 /app/.cache

# Add a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    chown -R nextjs:nodejs /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files and install production dependencies
COPY --from=builder /app/package.json .
COPY --from=builder /app/pnpm-lock.yaml .
RUN pnpm install --prod --frozen-lockfile

# Copy built application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs .

USER nextjs

EXPOSE 3000

CMD ["pnpm", "start"]
