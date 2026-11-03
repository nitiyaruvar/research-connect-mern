# Final submission and technical defense

## Project overview

Research Connect is a MERN application for discovering researchers, sharing research projects, and organizing collaboration requests. The React/Vite client communicates with an Express REST API. MongoDB documents are modeled with Mongoose.

## Architecture

- `frontend/` contains the Vite application, reusable researcher/project components, paginated discovery, profile and project management, collaboration inbox, API client, and optional AI match consent flow.
- `backend/` contains Express routes, request validators, controllers, Mongoose models, repositories, authentication middleware, and file storage services.
- `bruno/` contains runnable API request examples. Set the local Bruno environment before calling protected endpoints.
- `docker-compose.yml` runs MongoDB, the API, and the Nginx-served frontend for a local container setup.

The API keeps database access on the server. The browser never receives the MongoDB connection string or OpenAI API key. `GET /api/health` checks process liveness; `GET /api/ready` checks MongoDB readiness and returns 503 when it is disconnected.

## Data model and relationships

- A `User` owns zero or more `Project` records and can collaborate on projects owned by other users.
- A `Project` references its owner and collaborator users; it also stores research areas, keywords, status, dates, and optional attachment URLs.
- A `CollaborationRequest` references a requester, recipient, and project. Its status records the request lifecycle.
- An `UploadedFile` records the owner, public URL, and generated storage filename. Uploaded filenames are not accepted from clients.

MongoDB references suit the independently queried researcher, project, and request collections. The API populates only the related public fields needed for project and request views. Account removal deletes owned projects and requests, removes collaboration references, and cleans up owned uploads.

## API and security decisions

- Registration and login accept username/email identity and password. Passwords are stored as bcrypt hashes. Browser sessions use an HttpOnly cookie (SameSite=Lax locally and SameSite=None; Secure in production); the frontend requests cookie-only responses, while Bearer tokens remain available to Bruno and other API clients.
- JWT middleware protects write operations and account endpoints. Resource controllers check ownership; the admin role middleware handles administrator-only operations.
- Google OAuth is optional and uses a state check. Set the provider credentials and callback URL before enabling it.
- Request validators constrain input before controller/database operations. Public researcher/project queries avoid returning password hashes and private account details. Login, registration, and OAuth starts have per-IP rate limits; mutating browser requests must match a configured origin.
- Uploads are authenticated, size-limited, checked against allowed MIME types and file signatures, and stored under generated names. Uploaded files use public URLs; do not use this storage mode for confidential research material.
- AI matching is optional. Without consent, matching uses local research-term overlap. If consent is selected and `AI_API_KEY` is configured, a minimal set of project and candidate research fields is sent to OpenAI; names, emails, and account IDs are excluded. Suggestions are advisory.

## Demo walkthrough

1. Start MongoDB and the backend, then start the frontend.
2. Register a user or sign in. Create another account in a second browser session to demonstrate researcher discovery.
3. Create a project and inspect the project list.
4. Send a collaboration request, then accept or reject it from the recipient account.
5. Update a project and demonstrate ownership checks by trying the same action from another account.
6. Upload a supported image or PDF and inspect the returned URL.
7. Open the recommendations dialog. Show local matching first; explain that AI matching is opt-in and requires a configured key.
8. Use Bruno to show health, auth, project, request, upload, and recommendation endpoints.

## Local setup

Install Node.js 20+, npm, and Docker Desktop (or run MongoDB separately). Copy `backend/.env.example` to `backend/.env`, set `MONGODB_URI` and a long random `JWT_SECRET`, then install and run backend and frontend dependencies in their respective folders. The exact compose and deployment variables are in `docs/docker.md`, `docs/backend-deployment.md`, and `docs/frontend-deployment.md`.

To enable Google OAuth, configure `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`, and the matching provider console redirect URI. To enable AI ranking, set `AI_API_KEY` on the backend. Never commit populated environment files.

## Verification and limitations

Jest/Supertest tests cover health/readiness, security headers, origin checks, rate limiting, validation, query helpers, recommendations, and authentication boundaries. Five MongoDB integration tests exercise registration/login, project ownership, collaboration status, and upload attachment/deletion when `MONGODB_URI` points to an isolated test database; GitHub Actions supplies a disposable MongoDB service. The frontend is linted and built in GitHub Actions. The Docker configuration and cloud deployment still need a run against owner-controlled services. Render, Vercel, MongoDB, Google OAuth, and OpenAI credentials/service accounts must be supplied by the project owner. GitHub issue forms and the PR template are included; matching requirement issues remain to be created because the connected GitHub integration denied issue creation.

## Questions to prepare for

- **Why separate controllers, services, validators, and repositories?** Each module has a focused responsibility, which makes the API easier to review and test.
- **How are records protected?** Authentication establishes a user identity; controllers verify ownership before modifying project or request records.
- **Why references in MongoDB?** Projects and users are independently queried and can have many-to-many collaboration links; references avoid duplicating full user documents.
- **What happens if the AI service is unavailable?** AI is optional; local overlap recommendations remain available when the key is absent or the call fails.
- **What would you improve for production?** Use managed object storage and durable database backups, add rate limits and observability, configure least-privilege database users, and run CI/deployment checks with real service credentials.
