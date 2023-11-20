FROM node:20

# Path
WORKDIR /bot_challenge

# Copy package.json
COPY package.json .

# Install dependencies
RUN npm install

# Copy all files
COPY . .
