FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build 

FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./
ENV NODE_ENV=production
RUN npm ci --only=production

EXPOSE 3000

CMD ["npm" , "run" , "start"]

