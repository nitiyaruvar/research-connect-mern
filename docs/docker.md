# Docker Compose

Docker Compose runs MongoDB, the Express API, and the React app behind Nginx.

1. Install Docker Desktop.
2. Copy `.env.docker.example` to `.env` at the repository root. Set the MongoDB password to a random alphanumeric value and the JWT secret to a different random value of at least 32 characters; do not commit `.env`.
3. Run `docker compose up --build`.
4. Open `http://localhost:8080`. The API health endpoint is available at `http://localhost:8080/api/health`.
5. Stop the services with `docker compose down`. Data persists in the named `mongodb-data` and `research-uploads` volumes. To reset local demo data, remove those volumes with `docker compose down --volumes`.

The Compose stack is for local development and demonstrations. The MongoDB container uses its local root account for a compact example; production should use a managed database and a least-privilege application user. Configure Google OAuth redirect URLs and AI credentials only if those integrations are used. Keep the MongoDB password alphanumeric so it does not require percent-encoding in the connection string.
