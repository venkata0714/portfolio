# -------- Stage 1: Build Frontend --------
FROM node:18 AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# -------- Stage 2: Setup Backend + Serve Frontend --------
FROM node:18

WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Copy backend source
COPY backend ./backend

# Copy frontend build into backend/public
COPY --from=frontend-builder /app/frontend/build ./backend/public

# Expose backend port
EXPOSE 5000

# Start server
CMD ["node", "backend/index.js"]
