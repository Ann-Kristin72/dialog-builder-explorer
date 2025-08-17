# backend/Dockerfile
# Using Node.js 20 (Azure Web App runtime)
FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# Azure Web App standard port
ENV PORT=8181
EXPOSE 8181

# Start appen (bruk npm start hvis du har start-script)
CMD ["npm", "start"]
# alternativ: CMD ["node", "server.js"] 
