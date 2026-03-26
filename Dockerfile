# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app

# Copy package configurations
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install dependencies
RUN cd frontend && npm ci
RUN cd backend && npm ci

# Copy full source
COPY frontend ./frontend
COPY backend ./backend

# Generate Prisma Client & Build Astro SSR
RUN cd backend && npx prisma generate
RUN cd frontend && npm run build

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Install concurrently to run both Express and Astro Node SSR
RUN npm install -g concurrently

# Copy built frontend
COPY --from=build /app/frontend/dist ./frontend/dist
COPY --from=build /app/frontend/node_modules ./frontend/node_modules
COPY --from=build /app/frontend/package.json ./frontend/package.json

# Copy production backend
COPY --from=build /app/backend/node_modules ./backend/node_modules
COPY --from=build /app/backend/prisma ./backend/prisma
COPY --from=build /app/backend/package.json ./backend/package.json
COPY --from=build /app/backend/server.js ./backend/server.js
# Note: assuming routes/controllers are inside backend/ if any, copying the whole backend folder is safer
COPY --from=build /app/backend ./backend

# Variables for Astro Node adapter
ENV HOST=0.0.0.0
ENV PORT=4321
ENV NODE_ENV=production

# Coolify will map exposed ports
EXPOSE 4321 3000

# Start both servers simultaneously
CMD ["concurrently", "\"cd backend && npm start\"", "\"cd frontend && node ./dist/server/entry.mjs\""]
