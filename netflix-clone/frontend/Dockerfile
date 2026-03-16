# Stage 1: Build the React application
FROM node:22 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build # This command creates a production build of the React application in the 'build' directory

# Stage 2: Serve the built application using Nginx

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 