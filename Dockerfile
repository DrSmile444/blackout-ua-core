# Use the official Node.js 20 image as the base image
FROM node:20

# Create and set the working directory
WORKDIR /usr/src/app

# Copy the root package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the monorepo structure
COPY . .

# TODO add start from dist or remove it
# Build the application (if needed)
RUN npm run build

# Expose the ports the apps run on (if needed)
EXPOSE 3000 3001

# Define the default command to run the application (to be overridden in docker-compose)
CMD ["npm", "run", "start"]
