# backend/Dockerfile
# Using Node.js 18 for LangChain 0.1.x compatibility
# LangChain 0.1.x has known issues with Node.js 20
FROM node:18-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

# Copy backend files (build context is repository root)
COPY backend/ .

# Azure ruter til denne porten
ENV PORT=8181
EXPOSE 8181

# Start appen (bruk npm start hvis du har start-script)
CMD ["npm", "start"]
# alternativ: CMD ["node", "server.js"]
