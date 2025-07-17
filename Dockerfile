# ---------- Stage 1: Build React frontend ----------
FROM node:18 AS frontend-builder

WORKDIR /frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# ---------- Stage 2: Setup backend and serve frontend ----------
FROM node:18

WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Copy backend source
COPY backend ./backend

# Copy built frontend into backend/public
COPY --from=frontend-builder /frontend/build ./backend/public

# Expose backend port
EXPOSE 5000

# Start the backend server
CMD ["node", "backend/server.js"]
