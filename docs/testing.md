# Automated tests

The backend uses Jest and Supertest. From the `backend/` directory, run `npm ci`, then `npm test`. Run `npm run test:coverage` to produce a coverage report under `backend/coverage/`.

The API tests exercise health and readiness, security headers, origin checks, auth throttling, validation, malformed resource ids, and auth boundaries without requiring MongoDB. Five integration tests cover registration and login, project ownership, collaboration acceptance/withdrawal, and upload attachment/deletion when `MONGODB_URI` points to an isolated test database. GitHub Actions runs them against a disposable MongoDB service and runs frontend lint/build for pushes and pull requests. Never point tests at production data.
