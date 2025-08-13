# Use official Node.js LTS image
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install server dependencies
COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

# Copy server source
COPY server ./server

# Expose port and start server
WORKDIR /app/server
EXPOSE 4000
CMD ["npm", "start"]
