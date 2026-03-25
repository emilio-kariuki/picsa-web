# Picsa Frontend Deployment

This app serves both the public marketing site and the admin app from a single Next.js container.

Coolify should build from the repository root using the root-level [Dockerfile](/Users/mac/projects/picsa/Dockerfile).

## Domains

- `picsa.pro` routes to the marketing experience.
- `admin.picsa.pro` routes to the admin experience.

Both domains should point to the same container or VM service.

## Coolify

If `admin.picsa.pro` shows a certificate authority error, the problem is in the proxy or certificate layer, not the Next.js app.

Use a single Coolify frontend resource for this repo-root Docker build and attach both domains to that same resource:

- `https://picsa.pro`
- `https://admin.picsa.pro`

Checklist:

- Ensure the DNS record for `admin.picsa.pro` points to the same server or load balancer as `picsa.pro`.
- Remove `admin.picsa.pro` from any old or duplicate Coolify resource before attaching it here.
- Enable HTTPS certificate generation for both domains on the same frontend resource.
- Redeploy after the domains are attached so the proxy can request or refresh certificates.

If the proxy only has a certificate for `picsa.pro`, browsers will reject `admin.picsa.pro` before the app middleware can route the request.

## Docker

Build the frontend image from `/Users/mac/projects/picsa`:

```bash
docker build -t picsa-frontend .
docker run --rm -p 3000:3000 --env NEXT_PUBLIC_API_BASE_URL=https://api.picsa.pro picsa-frontend
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
