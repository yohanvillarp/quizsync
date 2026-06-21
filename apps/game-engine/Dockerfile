FROM node:20-alpine

WORKDIR /usr/src/app

RUN npm install -g pnpm @nestjs/cli

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --no-frozen-lockfile

COPY . .

RUN pnpm build

EXPOSE 3001

CMD ["pnpm", "start:prod"]
