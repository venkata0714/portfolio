# ---------- Base image ----------
FROM node:18 AS base

WORKDIR /app

# ---------- Install frontend ----------
FROM base AS frontend-builder
COPY frontend ./frontend
WORKDIR /app/frontend
RUN npm install
RUN npm run build

# ---------- Install backend ----------
FROM base AS backend-builder
COPY backend ./backend
WORKDIR /app/backend
COPY --from=frontend-builder /app/frontend/build ./build
RUN npm install

# ---------- Final stage ----------
FROM node:18-slim
WORKDIR /app
COPY --from=backend-builder /app/backend .

# Install only production dependencies
RUN npm install --omit=dev

# Expose port
EXPOSE 5000

# Start backend
CMD ["node", "server.js"]
