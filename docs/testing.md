# Automated tests

The backend uses Jest and Supertest. From the `backend/` directory, run `npm install` once, then `npm test`. Run `npm run test:coverage` to produce a coverage report under `backend/coverage/`.

The API tests exercise health and error responses, validation, malformed resource ids, and authentication boundaries without requiring a running MongoDB instance. Tests that exercise successful database writes should use an isolated test database and never connect to production data.
