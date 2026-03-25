# Picsa Frontend Deployment

This app serves both the public marketing site and the admin app from a single Next.js container.

## Domains

- `picsa.pro` routes to the marketing experience.
- `admin.picsa.pro` routes to the admin experience.

Both domains should point to the same container or VM service.

## Docker

Build the frontend image from `/Users/mac/projects/picsa/admin`:

```bash
docker build -f dockerfile -t picsa-frontend .
docker run --rm -p 3000:3000 --env NEXT_PUBLIC_API_BASE_URL=https://your-backend.example/api picsa-frontend
```

## Reverse proxy

Your proxy must preserve both `Host` and `X-Forwarded-Host` so middleware can route requests by domain.

Example Nginx upstream:

```nginx
server {
    listen 80;
    server_name picsa.pro admin.picsa.pro;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## Local development

Run the app locally from `/Users/mac/projects/picsa/admin` and map these hosts to `127.0.0.1` in your hosts file:

- `localhost`
- `admin.localhost`

Then start the app with `pnpm dev` and visit:

- `http://localhost:3000` for marketing
- `http://admin.localhost:3000` for admin
