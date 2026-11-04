const bcrypt = require("bcryptjs");
const User = require("../models/User");
const userRepository = require("../repositories/userRepository");
const { createAccessToken, getAccessTokenMaxAge } = require("../services/tokenService");
const { removeUserRelationships } = require("../services/relationshipService");
const { serializeCookie } = require("../utils/cookies");

function setAccessCookie(response, user) {
  const token = createAccessToken(user);
  response.append("Set-Cookie", serializeCookie("research_connect_token", token, { maxAge: getAccessTokenMaxAge(token) }));
  return token;
}

function sendAuthenticatedResponse(request, response, user, status = 200) {
  const token = setAccessCookie(response, user);
  const data = { user };
  if (request.query.session !== "cookie") data.token = token;
  return response.status(status).json({ data });
}

async function register(request, response) {
  const { name, username, email, password } = request.validatedBody;
  const existing = await User.findOne({ $or: [{ username }, { email }] }).select("_id");
  if (existing) return response.status(409).json({ message: "That username or email is already registered" });
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, username, email, password: passwordHash, authProvider: "local" });
  return sendAuthenticatedResponse(request, response, user, 201);
}

async function login(request, response) {
  const { identity, password } = request.validatedBody;
  const user = await userRepository.findForLogin(identity);
  const passwordMatches = user?.password ? await bcrypt.compare(password, user.password) : false;
  if (!passwordMatches) return response.status(401).json({ message: "Invalid username/email or password" });
  return sendAuthenticatedResponse(request, response, user);
}

async function currentUser(request, response) {
  const user = await userRepository.findById(request.user.id);
  if (!user) return response.status(404).json({ message: "Account not found" });
  response.json({ data: user });
}

async function updateCurrentUser(request, response) {
  const user = await User.findByIdAndUpdate(request.user.id, request.validatedBody, { new: true, runValidators: true });
  if (!user) return response.status(404).json({ message: "Account not found" });
  response.json({ data: user });
}

async function deleteCurrentUser(request, response) {
  if (request.body?.confirm !== true) return response.status(400).json({ message: "Confirm account deletion to continue" });
  const user = await User.findById(request.user.id);
  if (!user) return response.status(404).json({ message: "Account not found" });
  await removeUserRelationships(user.id);
  await user.deleteOne();
  response.append("Set-Cookie", serializeCookie("research_connect_token", "", { maxAge: 0 }));
  response.status(204).end();
}

module.exports = { currentUser, deleteCurrentUser, login, register, updateCurrentUser };
