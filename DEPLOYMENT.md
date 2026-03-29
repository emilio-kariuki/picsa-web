# Picsa Frontend Deployment

This app serves the public marketing site, the client organizer app, and the admin app from a single Next.js container.

Coolify should build from the repository root using the root-level [Dockerfile](/Users/mac/projects/picsa/Dockerfile).

## Domains

- `picsa.pro` routes to the marketing experience.
- `app.picsa.pro` routes to the client workspace.
- `admin.picsa.pro` routes to the admin experience.

Both domains should point to the same container or VM service.

## Coolify

If `admin.picsa.pro` shows a certificate authority error, the problem is in the proxy or certificate layer, not the Next.js app.

Use a single Coolify frontend resource for this repo-root Docker build and attach both domains to that same resource:

- `https://picsa.pro`
- `https://app.picsa.pro`
- `https://admin.picsa.pro`

Checklist:

- Ensure the DNS records for `app.picsa.pro` and `admin.picsa.pro` point to the same server or load balancer as `picsa.pro`.
- Remove `admin.picsa.pro` from any old or duplicate Coolify resource before attaching it here.
- Remove `app.picsa.pro` from any old or duplicate Coolify resource before attaching it here.
- Enable HTTPS certificate generation for all three domains on the same frontend resource.
- Redeploy after the domains are attached so the proxy can request or refresh certificates.

If the proxy only has a certificate for `picsa.pro`, browsers will reject `app.picsa.pro` or `admin.picsa.pro` before the app middleware can route the request.

## Docker

Build the frontend image from `/Users/mac/projects/picsa`:

```bash
docker build -t picsa-frontend .
docker run --rm -p 3000:3000 \
  --env NEXT_PUBLIC_API_BASE_URL=https://api.picsa.pro \
  --env NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-web-client-id \
  --env APPLE_CLIENT_ID=your-apple-services-id \
  picsa-frontend
```

The frontend requires `NEXT_PUBLIC_GOOGLE_CLIENT_ID` so the client workspace at `app.picsa.pro` can sign users in with Google. It must match the backend `GOOGLE_CLIENT_ID` audience.

The login page resolves the Google client id on the server at request time, so setting `NEXT_PUBLIC_GOOGLE_CLIENT_ID` on the running container is enough after a redeploy or restart. If your deployment already provides `GOOGLE_CLIENT_ID`, the web app will also accept that as a fallback.

For iPhone and iPad users, the client login page can also show Sign in with Apple. Set `APPLE_CLIENT_ID` or `NEXT_PUBLIC_APPLE_CLIENT_ID` to your Apple Services ID. It must match the backend `APPLE_CLIENT_ID`, and the Apple web auth configuration should include `app.picsa.pro` with `https://app.picsa.pro/login` as a return URL.

## Reverse proxy

Your proxy must preserve both `Host` and `X-Forwarded-Host` so middleware can route requests by domain.

Example Nginx upstream:

```nginx
server {
    listen 80;
    server_name picsa.pro app.picsa.pro admin.picsa.pro;

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

Run the app locally from `/Users/mac/projects/picsa/web` and map these hosts to `127.0.0.1` in your hosts file:

- `localhost`
- `admin.localhost`

Then start the app with `pnpm dev` and visit:

- `http://localhost:3002` for marketing
- `http://localhost:3002/login` for the client workspace
- `http://admin.localhost:3002/login` for admin

Local client auth intentionally runs on `localhost` so Google OAuth can use the supported local web origin `http://localhost:3002` during development.

If you need to run the frontend on a different local port, set `NEXT_PUBLIC_LOCAL_WEB_PORT` before starting Next so the generated subdomain links stay aligned with your dev server.
