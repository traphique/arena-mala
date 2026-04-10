# Build frontend, then run API + static assets on one Node process
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY server.js ./
COPY lib ./lib
RUN mkdir -p /app/samples
ENV SAMPLE_STORAGE_DIR=/app/samples
EXPOSE 4000
CMD ["node", "server.js"]
