FROM node:22-alpine


RUN apk update && apk upgrade --no-cache

WORKDIR /app


RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY package*.json ./


RUN npm install && \
    npm install glob@11.1.0 --save-exact && \
    npm install minimatch@10.2.3 --save-exact && \
    npm install tar@7.5.11 --save-exact && \
    npm cache clean --force

COPY . .


RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 3000

CMD ["node", "server.js"]