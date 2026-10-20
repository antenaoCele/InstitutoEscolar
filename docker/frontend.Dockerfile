FROM node:24-bookworm-slim AS build
RUN npm install --global pnpm@11.22.0
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN pnpm install --filter frontend --frozen-lockfile
COPY frontend frontend
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm --filter frontend build

FROM nginx:stable-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/frontend/dist /usr/share/nginx/html
EXPOSE 80
