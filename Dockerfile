# ---------- Stage 1: Build React frontend ----------
FROM node:18 AS frontend-builder

WORKDIR /frontend

# Copy and install frontend dependencies
COPY frontend/package*.json ./
COPY frontend/.env .env
RUN npm install

# Copy the rest of the frontend code
COPY frontend/ ./

# Build the frontend
RUN npm run build


# ---------- Stage 2: Build backend and serve frontend ----------
FROM node:18

WORKDIR /app

# Copy and install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Copy backend code and .env
COPY backend ./backend
COPY backend/.env ./backend/.env

# Copy built frontend into backend/public
COPY --from=frontend-builder /frontend/build ./backend/public

# Expose backend port
EXPOSE 5000

# Start backend server
CMD ["node", "backend/server.js"]
