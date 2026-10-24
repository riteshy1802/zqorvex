FROM node:20-slim

WORKDIR /app

# Enable pnpm package manager
RUN npm install -g pnpm

# Copy package definitions first for layer caching
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install

# Copy application source
COPY . .

# Expose Vite development server port
EXPOSE 5173

# Start development server accessible on all network interfaces
CMD ["pnpm", "run", "dev", "--host", "0.0.0.0"]
