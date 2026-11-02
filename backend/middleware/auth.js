const jwt = require("jsonwebtoken");

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === "replace-with-a-long-random-secret" || secret.length < 32) {
    throw new Error("JWT_SECRET must be configured with at least 32 characters.");
  }
  return secret;
}

function requireAuth(request, response, next) {
  const [scheme, token] = String(request.headers.authorization || "").split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return response.status(401).json({ message: "Sign in to continue" });
  }

  try {
    const payload = jwt.verify(token, getJwtSecret(), { algorithms: ["HS256"] });
    request.user = { id: payload.sub, role: payload.role, username: payload.username };
    return next();
  } catch (error) {
    if (error.message.includes("JWT_SECRET")) {
      return response.status(500).json({ message: "Authentication is not configured" });
    }
    return response.status(401).json({ message: "Token is invalid or expired" });
  }
}

function requireRole(...roles) {
  return (request, response, next) => {
    if (!request.user) return response.status(401).json({ message: "Sign in to continue" });
    if (!roles.includes(request.user.role)) return response.status(403).json({ message: "You do not have permission to access this resource" });
    return next();
  };
}

module.exports = { getJwtSecret, requireAuth, requireRole };
