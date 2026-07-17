FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .

ARG VITE_MP_PUBLIC_KEY=
RUN if [ -n "$VITE_MP_PUBLIC_KEY" ]; then echo "VITE_MP_PUBLIC_KEY=$VITE_MP_PUBLIC_KEY" >> /app/.env; fi
RUN npm run build

FROM nginx:1.27-alpine

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80 443

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/health >/dev/null 2>&1 || exit 1
