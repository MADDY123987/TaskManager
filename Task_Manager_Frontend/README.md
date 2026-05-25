# Team Task Manager Frontend

## Environment

Create a local `.env.local` file from `.env.example` and set:

```env
VITE_API_URL=https://your-render-service.onrender.com
```

`VITE_API_URL` must be the Spring Boot backend base URL. Do not include a trailing slash. API requests and the SockJS/STOMP endpoint are derived from this single value.

## Local Development

1. Install dependencies with `npm install`.
2. Set `VITE_API_URL` in `.env.local` to the backend you want to use.
3. Run `npm run dev`.

## Production Deployment On Vercel

1. Import this frontend repository into Vercel.
2. Set the Vercel environment variable `VITE_API_URL` to your Render backend URL.
3. Use the build command `npm run build`.
4. Use `dist` as the output directory.

Changing the backend deployment only requires updating `VITE_API_URL` in Vercel and redeploying the frontend.
