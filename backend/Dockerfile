# syntax=docker/dockerfile:1

FROM node:20-alpine

WORKDIR /app

# Installer system-avhengigheter
RUN apk add --no-cache python3 make g++

# Kopier package files
COPY package*.json ./

# Installer prod-avhengigheter
RUN npm ci --omit=dev

# Kopier kildekode
COPY . .

# Opprett nødvendige mapper
RUN mkdir -p uploads

# Hardening
ENV NODE_ENV=production
ENV TZ=Europe/Oslo

# Eksponer port (App Service leser også WEBSITES_PORT)
ENV PORT=3000
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/healthz', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start
CMD ["node", "src/server.js"]
