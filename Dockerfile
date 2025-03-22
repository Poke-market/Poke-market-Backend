FROM node:22 AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:22-slim
WORKDIR /usr/src/app
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY --from=builder /usr/src/app/dist ./dist
COPY package*.json ./
RUN npm install --production
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/server.mjs"]