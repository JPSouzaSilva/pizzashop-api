FROM oven/bun

WORKDIR /app

COPY package.json bun.lockb drizzle.config.ts ./

RUN bun install --production

COPY . .

CMD ["bun", "dev"]

EXPOSE 8080