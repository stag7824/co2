# syntax=docker/dockerfile:1.6
# ---------- build stage ----------
FROM node:22-alpine AS build
WORKDIR /app

# Install deps with cache-friendly layering
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build static site
COPY . .
RUN npm run build

# ---------- runtime stage ----------
# nginx-alpine serves the static dist/ on port 3000.
FROM nginx:1.27-alpine AS runtime

# Replace default nginx config with one that listens on 3000 and supports pretty URLs.
RUN rm -f /etc/nginx/conf.d/default.conf
COPY <<'EOF' /etc/nginx/conf.d/reduceco2now.conf
server {
    listen       3000;
    listen  [::]:3000;
    server_name  _;

    root   /usr/share/nginx/html;
    index  index.html;

    # gzip
    gzip on;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;
    gzip_min_length 1024;

    # cache static assets aggressively
    location ~* \.(?:css|js|woff2?|svg|png|jpg|jpeg|gif|webp|ico)$ {
        expires 30d;
        add_header Cache-Control "public, max-age=2592000, immutable";
        try_files $uri =404;
    }

    # security headers
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options SAMEORIGIN always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

    # Astro pretty URLs: try exact -> directory index -> 404 page
    location / {
        try_files $uri $uri/ $uri.html $uri/index.html /404.html;
    }

    error_page 404 /404.html;
}
EOF

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 3000

# Healthcheck (optional, helpful for orchestrators)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://127.0.0.1:3000/ > /dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
