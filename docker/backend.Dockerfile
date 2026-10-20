FROM node:24-bookworm-slim AS base
RUN npm install --global pnpm@11.22.0
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN pnpm install --filter backend --prod --frozen-lockfile
COPY --chown=node:node backend backend
WORKDIR /app/backend
USER node
EXPOSE 3000
CMD ["node", "index.js"]
