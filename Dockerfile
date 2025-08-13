# Build client
FROM node:18-alpine AS client-build
WORKDIR /app
COPY client/package*.json ./client/
RUN cd client && npm install && npm run build

# Production image
FROM node:18-alpine
WORKDIR /app

# Install server dependencies
COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

# Copy server source
COPY server ./server

# Copy built client
COPY --from=client-build /app/client/dist ./server/public

WORKDIR /app/server
EXPOSE 4000
CMD ["npm", "start"]
