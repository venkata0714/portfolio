# Stage 1: Build React frontend
FROM node:18 AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build backend and serve
FROM node:18

WORKDIR /app

# Copy backend
COPY backend/package*.json ./
RUN npm install

COPY backend/ ./

# Copy built React frontend into backend/build
COPY --from=frontend-builder /app/frontend/build ./build

# Expose port
EXPOSE 5000

# Start the server
CMD [ "node", "server.js" ]
