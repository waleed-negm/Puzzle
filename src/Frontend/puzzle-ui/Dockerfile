FROM node:22-alpine AS build
WORKDIR /app

COPY src/Frontend/puzzle-ui/package*.json ./
RUN npm ci

COPY src/Frontend/puzzle-ui/ .
RUN npm run build

FROM nginx:alpine
COPY src/Frontend/puzzle-ui/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist/puzzle-ui/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
