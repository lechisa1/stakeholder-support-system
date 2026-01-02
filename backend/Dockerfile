# Stage 1: Build Stage
FROM node:20 AS builder

WORKDIR /app

# Copy dependency files first
COPY package*.json ./

# Install dependencies (only production deps later)
RUN npm ci --legacy-peer-deps

# Copy all source files
COPY . .

# Optional: Run build step (if using TypeScript or bundler)
# RUN npm run build

# Stage 2: Runtime Stage
FROM node:20-alpine

WORKDIR /app

# Copy only needed files from build stage
COPY --from=builder /app ./

# Set NODE_ENV to production for optimization
ENV NODE_ENV=production

# Install only production dependencies
RUN npm ci --only=production --legacy-peer-deps

# Expose the app port
EXPOSE 4000

# Start the app
CMD ["npm", "start"]
