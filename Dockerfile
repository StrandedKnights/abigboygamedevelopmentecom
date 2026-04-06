# Unified Dockerfile for consolidated Astro SSR + Prisma project
# Stage 1: Build
FROM node:20-alpine AS build
RUN apk add --no-cache openssl

WORKDIR /app

# Prevent Astro SSR prerendering from failing when fetching from local/proxy
ENV NODE_TLS_REJECT_UNAUTHORIZED=0

# Copy package configurations from the frontend directory
COPY frontend/package*.json ./
# prisma is inside the frontend directory
COPY frontend/prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy full source from the frontend directory
COPY frontend .

# Generate Prisma Client & Build Astro SSR
RUN npx prisma generate
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production
RUN apk add --no-cache openssl

WORKDIR /app

# Copy built frontend bits
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

# Environment variables for Astro Node adapter
ENV HOST=0.0.0.0
ENV PORT=4321
ENV NODE_ENV=production
# SEC-7 FIX: NODE_TLS_REJECT_UNAUTHORIZED=0 removed from production.
# TLS certificate verification is now enforced for all outbound HTTPS connections.
# If Coolify's reverse proxy causes SSL issues, fix the proxy cert chain instead.

# Database is handled at runtime via environment variables passed to the container
EXPOSE 4321

# Start the unified Astro SSR server using our secrets aware entrypoint
COPY scripts/entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["node", "./dist/server/entry.mjs"]
