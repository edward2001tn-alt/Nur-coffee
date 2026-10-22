# Multi-stage image for web and worker (same image, different command).
# NOTE: not built/verified in the development session (Docker was not available on that machine).
FROM node:22.23.4-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts=false

FROM node:22.23.4-bookworm-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate && npx next build

FROM node:22.23.4-bookworm-slim AS run
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
RUN apt-get update && apt-get install -y --no-install-recommends openssl postgresql-client && rm -rf /var/lib/apt/lists/*
COPY --from=build /app ./
USER node
EXPOSE 3000
CMD ["npx", "next", "start", "-p", "3000"]
