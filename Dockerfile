# Multi-stage Dockerfile for AL ANSAR E-Commerce Platform
FROM node:20-alpine AS builder

WORKDIR /app

# Copy client files and build
COPY client/package*.json ./client/
RUN cd client && npm install

COPY client ./client
RUN cd client && npm run build

# Final runtime image
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

# Copy server package and install dependencies
COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

# Copy server source code
COPY server ./server

# Copy built frontend assets to client/dist
COPY --from=builder /app/client/dist ./client/dist

# Expose port
EXPOSE 5000

# Start server
CMD ["node", "server/server.js"]
