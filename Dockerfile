# Stage 1: Build frontend
FROM node:18 AS builder
WORKDIR /app

# Copy frontend first and install+build
COPY frontend ./frontend
WORKDIR /app/frontend
RUN npm install && npm run build

# Stage 2: Run backend
FROM node:18
WORKDIR /app

# Copy backend and built frontend
COPY backend ./backend
COPY --from=builder /app/frontend/build ./backend/build

# Install backend dependencies
WORKDIR /app/backend
RUN npm install

# Expose port
EXPOSE 5000

# Start backend (which also serves frontend)
CMD ["node", "server.js"]
