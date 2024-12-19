# Use Node.js base image (Alpine version)
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Rebuild bcrypt for the correct platform
RUN apk add --no-cache make gcc g++ python3 && \
    npm rebuild bcrypt --build-from-source && \
    apk del make gcc g++ python3

# Expose port
EXPOSE 5000

# Start the application in dev mode for demonstration purposes
CMD ["npm", "run", "dev"]