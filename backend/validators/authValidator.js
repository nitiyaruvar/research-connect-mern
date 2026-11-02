const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernamePattern = /^[a-z0-9_]{3,30}$/;

function validateRegistration(request, response, next) {
  const body = request.body || {};
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const username = typeof body.username === "string" ? body.username.trim().toLowerCase() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!name || name.length > 100) return response.status(400).json({ message: "Name must contain 1 to 100 characters" });
  if (!usernamePattern.test(username)) return response.status(400).json({ message: "Username must be 3 to 30 letters, numbers, or underscores" });
  if (!emailPattern.test(email) || email.length > 254) return response.status(400).json({ message: "Enter a valid email address" });
  if (password.length < 12 || password.length > 128 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[^a-zA-Z0-9]/.test(password)) {
    return response.status(400).json({ message: "Password must be 12–128 characters and include uppercase, lowercase, number, and symbol characters" });
  }
  request.validatedBody = { name, username, email, password };
  return next();
}

function validateLogin(request, response, next) {
  const identity = typeof request.body?.identity === "string" ? request.body.identity.trim().toLowerCase() : "";
  const password = typeof request.body?.password === "string" ? request.body.password : "";
  if (!identity || identity.length > 254 || !password) return response.status(400).json({ message: "Username/email and password are required" });
  request.validatedBody = { identity, password };
  return next();
}

module.exports = { validateLogin, validateRegistration };
