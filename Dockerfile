FROM node:22-slim

WORKDIR /app

RUN npm install -g pnpm@11.7.0

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

RUN pnpm install --no-frozen-lockfile

COPY . .

RUN pnpm --filter @workspace/backend run build

EXPOSE 8080

CMD ["node", "--enable-source-maps", "./backend/dist/index.mjs"]
