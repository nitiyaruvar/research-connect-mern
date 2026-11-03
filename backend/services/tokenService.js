const jwt = require("jsonwebtoken");
const { getJwtSecret } = require("../middleware/auth");

function createAccessToken(user) {
  return jwt.sign(
    { role: user.role, username: user.username },
    getJwtSecret(),
    { subject: String(user.id || user._id), expiresIn: process.env.JWT_EXPIRES_IN || "1d", algorithm: "HS256" },
  );
}

function getAccessTokenMaxAge(token) {
  const expiration = jwt.decode(token)?.exp;
  return Number.isInteger(expiration) ? Math.max(0, expiration - Math.floor(Date.now() / 1000)) : 0;
}

module.exports = { createAccessToken, getAccessTokenMaxAge };
