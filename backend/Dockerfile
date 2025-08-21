# backend/Dockerfile
# Using Node.js 20 (Azure Web App runtime)
FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev --silent

# Copy source code
COPY . .

# Azure Web App standard port (80 works better than 8181)
ENV PORT=80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:80/healthz', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["npm", "start"] 
