FROM node:20-alpine

WORKDIR /usr/src/app

RUN npm install -g pnpm @nestjs/cli

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --no-frozen-lockfile

COPY . .

# Generar cliente de Prisma
RUN pnpm dlx prisma generate

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start:prod"]
