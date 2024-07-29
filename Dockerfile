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

# Specify the default port on which the app will run
ENV PORT=3000

# Expose the port specified by the environment variable
EXPOSE $PORT

# Define the command to start the app
CMD ["npm", "run", "start-server-docker"]
