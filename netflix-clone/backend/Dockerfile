
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./


RUN npm install


COPY . .


FROM node:22-


RUN apk update && apk upgrade --no-cache

RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx

WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup


COPY --from=builder --chown=appuser:appgroup /app/package*.json ./


RUN npm ci --omit=dev && \
    npm cache clean --force


COPY --from=builder --chown=appuser:appgroup /app ./

USER appuser

EXPOSE 3000

CMD ["node", "server.js"]