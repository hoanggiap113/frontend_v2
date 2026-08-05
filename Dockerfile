FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=development
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable

COPY package.json pnpm-workspace.yaml ./
RUN pnpm install --no-frozen-lockfile

COPY tsconfig.json vite.config.ts ./
COPY public ./public
COPY src ./src

EXPOSE 3000

CMD ["pnpm", "exec", "vite", "dev", "--host", "0.0.0.0", "--port", "3000"]
