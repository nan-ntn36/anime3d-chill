# ── Development Stage ────────────────────────────
FROM node:20-alpine AS dev

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 5000

# Start dev server
CMD ["npm", "run", "dev"]

# ── Production Stage ─────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package.json ./

# Install production dependencies only
RUN npm install --omit=dev

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/v1/health || exit 1

# Start production server
CMD ["node", "src/index.js"]
