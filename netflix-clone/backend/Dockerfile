# Stage 1: Builder stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev dependencies for building)
RUN npm install

# Copy application source
COPY . .

# Stage 2: Production stage
FROM node:22-alpine

# Fix OS-level vulnerabilities (including zlib CVE)
RUN apk update && apk upgrade --no-cache

WORKDIR /app

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy package files from builder
COPY --from=builder --chown=appuser:appgroup /app/package*.json ./

# Install ONLY production dependencies - NO dev dependencies!
# This avoids all the vulnerable packages (glob, minimatch, tar, etc.)
RUN npm ci --omit=dev && \
    npm prune --omit=dev && \ 
    npm cache clean --force

# Copy application code from builder
COPY --from=builder --chown=appuser:appgroup /app ./

# Switch to non-root user
USER appuser

EXPOSE 3000

CMD ["node", "server.js"]