# frontend/Dockerfile
FROM node:20-alpine

WORKDIR /app
# Installation de pnpm de manière performante
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package*.json pnpm-lock.yaml* ./

RUN pnpm install

COPY . .

EXPOSE 5173

CMD ["pnpm", "dev", "--host", "0.0.0.0"]