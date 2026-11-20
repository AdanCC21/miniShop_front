FROM node:24-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --global npm@11.5.2 \
    && npm ci

COPY . .

ENV NG_APP_BACKEND_ROUTE=${NG_APP_BACKEND_ROUTE}
ENV FRONTEND_PORT=${FRONTEND_PORT}

RUN npm run build

FROM nginx:alpine AS production

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/miniShop/browser /usr/share/nginx/html

EXPOSE 80
