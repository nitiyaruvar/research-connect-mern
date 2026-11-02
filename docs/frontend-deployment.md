# Frontend deployment

The React app is a Vite single-page application and includes `frontend/vercel.json` for SPA deep links.

## Vercel setup

1. Import this GitHub repository into Vercel.
2. Set the project **Root Directory** to `frontend` and use the Vite framework preset.
3. Use `npm run build` as the build command and `dist` as the output directory if Vercel does not detect them automatically.
4. Add `VITE_API_URL=https://<your-backend-host>/api` to the Production and Preview environments. Vite embeds `VITE_` values during the build, so redeploy after changing the API URL.
5. Add the deployed frontend origin to the backend's `CLIENT_ORIGIN` environment variable.
6. Open the deployed frontend and verify that researcher and project lists load from the backend. If the API is unavailable, the page shows sample preview data.

Vercel supports per-project build settings and SPA rewrite configuration. See the [Vite deployment guide](https://vercel.com/docs/frameworks/frontend/vite) and [project configuration reference](https://vercel.com/docs/project-configuration/vercel-json).

This repository contains deployment configuration only; it does not create a Vercel project or deploy a live site.
