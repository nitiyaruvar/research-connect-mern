const jwt = require("jsonwebtoken");
const { getJwtSecret } = require("../middleware/auth");

function createAccessToken(user) {
  return jwt.sign(
    { role: user.role, username: user.username },
    getJwtSecret(),
    { subject: String(user.id || user._id), expiresIn: process.env.JWT_EXPIRES_IN || "1d", algorithm: "HS256" },
  );
}

module.exports = { createAccessToken };
