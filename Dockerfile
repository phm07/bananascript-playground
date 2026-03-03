FROM golang:1.24-alpine AS wasm

WORKDIR /app
COPY bananascript/ ./bananascript/
RUN cd bananascript && \
    GOOS=js GOARCH=wasm go build -o ../public/bananascript.wasm ./cmd/wasm && \
    cp "$(go env GOROOT)/lib/wasm/wasm_exec.js" ../public/

FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY src/ ./src/
COPY index.html tsconfig.json vite.config.ts ./
COPY --from=wasm /app/public/ ./public/
RUN npx vite build

FROM nginx:alpine

COPY --from=build /app/dist/ /usr/share/nginx/html/
