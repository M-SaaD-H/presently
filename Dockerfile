FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY apps ./apps
COPY packages ./packages
RUN pnpm install --frozen-lockfile
RUN pnpm build

# Web runner stage
FROM base AS web
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app ./
EXPOSE 3000
CMD ["pnpm", "--filter", "@sitecast/web", "start"]

# Worker runner stage
FROM base AS worker
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y \
    xvfb \
    x11-utils \
    ffmpeg \
    chromium \
    && rm -rf /var/lib/apt/lists/*
ENV CHROME_EXECUTABLE=/usr/bin/chromium
COPY --from=builder /app ./
RUN mkdir -p output tmp /tmp/.X11-unix && chmod 1777 /tmp/.X11-unix
EXPOSE 3001
CMD ["pnpm", "--filter", "@sitecast/worker", "start"]
