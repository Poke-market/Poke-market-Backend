FROM node:22 AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:22-slim
WORKDIR /usr/src/app
# Install python3, make, and g++ for node-gyp to compile bcrypt (native module)
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY --from=builder /usr/src/app/dist ./dist
COPY package*.json ./
RUN npm install --production
ENV PORT=3000
EXPOSE 3000
CMD ["node", "dist/server.mjs"]