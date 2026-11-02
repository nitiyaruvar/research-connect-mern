const bcrypt = require("bcryptjs");
const User = require("../models/User");
const userRepository = require("../repositories/userRepository");
const { createAccessToken } = require("../services/tokenService");

async function register(request, response) {
  const { name, username, email, password } = request.validatedBody;
  const existing = await User.findOne({ $or: [{ username }, { email }] }).select("_id");
  if (existing) return response.status(409).json({ message: "That username or email is already registered" });
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, username, email, password: passwordHash, authProvider: "local" });
  response.status(201).json({ data: { user, token: createAccessToken(user) } });
}

async function login(request, response) {
  const { identity, password } = request.validatedBody;
  const user = await userRepository.findForLogin(identity);
  const passwordMatches = user?.password ? await bcrypt.compare(password, user.password) : false;
  if (!passwordMatches) return response.status(401).json({ message: "Invalid username/email or password" });
  response.json({ data: { user, token: createAccessToken(user) } });
}

async function currentUser(request, response) {
  const user = await userRepository.findById(request.user.id);
  if (!user) return response.status(404).json({ message: "Account not found" });
  response.json({ data: user });
}

module.exports = { currentUser, login, register };
