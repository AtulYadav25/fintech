FROM node:20

WORKDIR /app

# install pnpm
RUN npm install -g pnpm

# copy only package files first
COPY package.json pnpm-lock.yaml* ./

# install deps
RUN pnpm install

# copy rest (will be overridden by volume anyway)
COPY . .

EXPOSE 3000

# run dev mode (hot reload)
CMD ["pnpm", "dev"]