FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard so both package and package-lock copied
COPY package*.json ./
RUN npm ci --omit=dev

# Bundle app source
COPY . .

# Run
CMD [ "node", "index.js" ]
