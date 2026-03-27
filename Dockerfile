# Unified Dockerfile for consolidated Astro SSR + Prisma project
# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app

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

WORKDIR /app

# Copy built frontend bits
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

# Environment variables for Astro Node adapter
ENV HOST=0.0.0.0
ENV PORT=4321
ENV NODE_ENV=production

# Database is handled at runtime via environment variables passed to the container
EXPOSE 4321

# Start the unified Astro SSR server
CMD ["node", "./dist/server/entry.mjs"]
