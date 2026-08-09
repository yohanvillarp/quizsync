FROM node:20-alpine

WORKDIR /usr/src/app

RUN apk add --no-cache openssl
RUN npm install -g pnpm @nestjs/cli

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
RUN pnpm install --no-frozen-lockfile

COPY . .

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start:prod"]
