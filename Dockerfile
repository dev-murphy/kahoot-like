# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS base
WORKDIR /app

# ---------------------------------------------------------------------------
# Install dependencies (needs build tools for better-sqlite3's native addon)
# ---------------------------------------------------------------------------
FROM base AS deps
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci

# ---------------------------------------------------------------------------
# Build the Nuxt app (Nitro's node-server preset bundles native deps like
# better-sqlite3 into .output/server/node_modules, so the runtime image
# below needs nothing beyond .output itself)
# ---------------------------------------------------------------------------
FROM deps AS build
COPY . .
RUN npm run build

# ---------------------------------------------------------------------------
# Slim runtime image
# ---------------------------------------------------------------------------
FROM base AS runtime
ENV NODE_ENV=production
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000
ENV DB_PATH=/app/data/game.db

COPY --from=build /app/.output ./.output
RUN mkdir -p /app/data

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
