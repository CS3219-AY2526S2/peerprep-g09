# /frontend/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Next.js dev mode
EXPOSE 3000
CMD ["npm", "run", "dev"]
