FROM node:24-slim AS build

RUN apt-get update && apt-get -y install make python3

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:24-slim AS runtime

RUN apt-get update && apt-get -y install make python3

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build app/dist dist
COPY drizzle drizzle

EXPOSE 3000
CMD ["node", "dist/main"]
