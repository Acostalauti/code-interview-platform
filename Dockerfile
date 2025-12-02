# Multi-stage build for Code Interview Platform
# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/client

# Copy package files
COPY client/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY client/ ./

# Build frontend
RUN npm run build

# Stage 2: Build Backend
FROM node:20-alpine AS backend-builder

WORKDIR /app/server

# Copy package files
COPY server/package*.json ./
COPY server/tsconfig.json ./

# Install all dependencies (including dev for build)
RUN npm ci

# Copy source code
COPY server/src ./src

# Build TypeScript
RUN npm run build

# Install production dependencies only
RUN npm ci --production

# Stage 3: Production Image
FROM node:20-alpine

# Install nginx, supervisor, and gettext (for envsubst)
RUN apk add --no-cache nginx supervisor gettext

# Create app directory
WORKDIR /app

# Copy backend build and production dependencies
COPY --from=backend-builder /app/server/dist ./server/dist
COPY --from=backend-builder /app/server/node_modules ./server/node_modules
COPY --from=backend-builder /app/server/package.json ./server/package.json

# Copy frontend build
COPY --from=frontend-builder /app/client/dist ./client/dist

# Copy nginx configuration as template
COPY nginx.conf /etc/nginx/nginx.conf.template

# Copy supervisor configuration
COPY supervisord.conf /etc/supervisord.conf

# Copy start script
COPY start.sh /app/start.sh

# Create necessary directories and set permissions
RUN mkdir -p /var/log/nginx /var/log/supervisord /run/nginx /var/run/supervisord && \
    chown -R node:node /app /var/log/nginx /var/log/supervisord /run/nginx /var/run/supervisord /etc/nginx /var/lib/nginx && \
    chmod -R 755 /app && \
    chmod +x /app/start.sh

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Run as non-root user
USER node

# Start via start script
CMD ["/app/start.sh"]
