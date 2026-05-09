FROM node:20-alpine AS builder

RUN corepack enable pnpm
WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# Build the application
COPY . .
RUN pnpm run build

# Final production stage
FROM node:20-alpine

RUN corepack enable pnpm
WORKDIR /app

# Install production dependencies only
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod

# Copy built application
COPY --from=builder /app/build ./build

# Start the application
CMD ["pnpm", "run", "start"]