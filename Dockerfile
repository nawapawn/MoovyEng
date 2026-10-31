# Use an official Python runtime with Node.js support
FROM node:20-bookworm-slim

# Set working directory
WORKDIR /app

# Install Python3, FFmpeg, and build essentials
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    ffmpeg \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install node dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source code
COPY . .

# Build Next.js application
RUN npm run build

# Expose ports: 3000 (Next.js) and 3001 (Node & Python Clip Engine)
EXPOSE 3000 3001

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start both media engine (3001) and Next.js web studio (3000)
CMD node server.js & npm start
