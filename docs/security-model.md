# Authentication and authorization

- Registration stores passwords as bcrypt hashes. Password hashes and third-party provider IDs are excluded from normal database reads and JSON responses.
- Login sets an HttpOnly cookie for browser sessions and returns a signed HS256 token for API clients. Cookies use SameSite=Lax locally and SameSite=None; Secure in production for separately hosted frontends. Protected routes accept the cookie or `Authorization: Bearer <token>`.
- Configure `JWT_SECRET` as a randomly generated value of at least 32 characters. Keep it in a private environment variable store.
- Tokens carry a subject, username, and role and expire according to `JWT_EXPIRES_IN` (one day by default). The server verifies the algorithm and signature.
- Login, registration, and OAuth initiation have per-IP rate limits. Configure `TRUST_PROXY_HOPS` only for the known reverse-proxy chain so client IPs cannot be forged.
- Mutating browser requests are restricted to the configured `CLIENT_ORIGIN` list. Requests without an `Origin` header remain available to CLI clients.
- Responses set MIME-sniffing, frame, referrer, and permissions headers. Production responses include HSTS.
- Researchers can edit or remove only their own projects. Collaboration participants can respond to their requests; only the requester can remove a request. Admin-only routes require the `admin` role.
- Registration never accepts a role from the request body. Assign the first administrator directly through a trusted database operation, then use the admin-only endpoints.
- The example environment file contains placeholders, not working credentials.
