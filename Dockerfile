FROM node:20-alpine AS build
WORKDIR /app

ARG DOMUS_API_BASE_URL
ARG DOMUS_STORAGE_PREFIX=domus
ENV DOMUS_API_BASE_URL=$DOMUS_API_BASE_URL
ENV DOMUS_STORAGE_PREFIX=$DOMUS_STORAGE_PREFIX

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build:prod

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/www /usr/share/nginx/html

EXPOSE 8080
