# Backend deployment

The repository includes a Render Blueprint at `render.yaml`. Render supports a Node web service with a monorepo `rootDir`, build/start commands, environment variables, and an HTTP health check. Review the Blueprint in your Render account before creating services.

## Required setup

1. Create a MongoDB database with network access limited to the deployment service where possible.
2. In Render, create a Blueprint from this repository and review the service settings.
3. Set `MONGODB_URI` to the private connection string for the database.
4. Set `CLIENT_ORIGIN` to the deployed frontend origin (for example `https://research-connect.example`). Do not use `*` with credentialed requests.
5. The Blueprint generates `JWT_SECRET`. Keep it in Render's secret environment variables and rotate it if it is exposed.
6. If Google sign-in is enabled, set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_CALLBACK_URL`; register the callback URL in the Google OAuth client.
7. Verify `GET /api/health` returns HTTP 200, then verify `GET /api/ready` returns HTTP 200 with the database connected.

## Uploaded files

The current upload implementation stores files on local disk. The Render Blueprint mounts a persistent disk at `/var/data` and sets `UPLOAD_DIR=/var/data/uploads`; review the disk size and service cost in Render before deployment. For horizontal scaling or private documents, replace local storage with managed object storage and access-controlled downloads.

This repository contains deployment configuration only. It does not provision a database, add credentials, or deploy a live service.
