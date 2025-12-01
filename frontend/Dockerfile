FROM node:20-alpine AS build
WORKDIR /front_app

COPY package*.json ./
ENV NPM_CONFIG_LEGACY_PEER_DEPS=true
RUN npm ci --no-audit --no-fund

COPY . .

RUN npm run build

FROM nginx:stable-alpine
COPY --from=build /front_app/build /usr/share/nginx/html
RUN mkdir -p /usr/share/nginx/html/ifc
COPY --from=build /front_app/node_modules/web-ifc/web-ifc.wasm /usr/share/nginx/html/ifc/
COPY nginx.default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]