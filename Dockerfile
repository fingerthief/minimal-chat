# Use an official Node.js runtime as the base image
FROM node:14

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Copy the rest of the application code to the working directory
COPY ./dist  .

# Install the app dependencies
RUN npm install

# Specify the port on which the app will run
EXPOSE 3000

# Define the command to start the app
CMD ["npm", "run", "start-server-docker"]