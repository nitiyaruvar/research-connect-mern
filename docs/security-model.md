# Authentication and authorization

- Registration stores passwords as bcrypt hashes. Password hashes and third-party provider IDs are excluded from normal database reads and JSON responses.
- Login returns a signed HS256 JWT. The API requires `Authorization: Bearer <token>` for writes and personal collaboration data.
- Configure `JWT_SECRET` as a randomly generated value of at least 32 characters. Keep it in a private environment variable store.
- Tokens carry a subject, username, and role and expire according to `JWT_EXPIRES_IN` (one day by default). The server verifies the algorithm and signature.
- Researchers can edit or remove only their own projects. Collaboration participants can respond to their requests; only the requester can remove a request. Admin-only routes require the `admin` role.
- Registration never accepts a role from the request body. Assign the first administrator directly through a trusted database operation, then use the admin-only endpoints.
- The example environment file contains placeholders, not working credentials.
