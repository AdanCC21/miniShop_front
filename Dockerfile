FROM node:24-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --global npm@11.5.2 \
    && npm ci

COPY . .

ARG NG_APP_BACKEND_ROUTE
RUN test -n "$NG_APP_BACKEND_ROUTE" || (echo "NG_APP_BACKEND_ROUTE debe configurarse al construir el frontend." >&2; exit 1)
ENV NG_APP_BACKEND_ROUTE=${NG_APP_BACKEND_ROUTE}

RUN npm run build

FROM nginx:alpine AS production

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/miniShop/browser /usr/share/nginx/html

EXPOSE 80
