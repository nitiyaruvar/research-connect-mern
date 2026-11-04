const crypto = require("node:crypto");
const User = require("../models/User");
const { createAccessToken, getAccessTokenMaxAge } = require("../services/tokenService");
const { getCookie, serializeCookie } = require("../utils/cookies");

const STATE_COOKIE = "research_connect_oauth_state";
const ACCESS_COOKIE = "research_connect_token";

function getClientOrigin() {
  return (process.env.CLIENT_ORIGIN || "http://localhost:5173").split(",")[0].trim();
}

function startGoogleAuth(_request, response) {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return response.status(503).json({ message: "Google sign-in is not configured" });
  }
  const state = crypto.randomBytes(32).toString("base64url");
  response.append("Set-Cookie", serializeCookie(STATE_COOKIE, state, { maxAge: 600, path: "/api/auth/google/callback" }));
  const query = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback",
    response_type: "code",
    scope: "openid email profile",
    state,
  });
  return response.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${query}`);
}

async function googleCallback(request, response) {
  const clearStateCookie = serializeCookie(STATE_COOKIE, "", { maxAge: 0, path: "/api/auth/google/callback" });
  response.append("Set-Cookie", clearStateCookie);
  const state = String(request.query.state || "");
  const storedState = getCookie(request.headers.cookie, STATE_COOKIE);
  if (!state || !storedState || state !== storedState) {
    return response.status(400).json({ message: "Google sign-in state did not match; try again" });
  }
  if (request.query.error || !request.query.code) {
    return response.redirect(`${getClientOrigin()}/?oauth=cancelled`);
  }

  try {
    const callbackUrl = process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback";
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: String(request.query.code),
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: callbackUrl,
        grant_type: "authorization_code",
      }),
    });
    if (!tokenResponse.ok) throw new Error("Token exchange failed");
    const tokens = await tokenResponse.json();
    const profileResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    if (!profileResponse.ok) throw new Error("Profile lookup failed");
    const profile = await profileResponse.json();
    if (!profile.email || profile.email_verified !== true || !profile.sub) {
      return response.status(403).json({ message: "Google did not provide a verified email" });
    }

    let user = await User.findOne({ $or: [{ authProvider: "google", providerId: profile.sub }, { email: profile.email.toLowerCase() }] });
    if (user) {
      user.authProvider = "google";
      user.providerId = profile.sub;
      if (!user.profilePicture && profile.picture) user.profilePicture = profile.picture;
      await user.save();
    } else {
      const baseUsername = String(profile.email).split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 22) || "researcher";
      const username = `${baseUsername}_${crypto.randomBytes(3).toString("hex")}`;
      user = await User.create({
        name: String(profile.name || baseUsername).slice(0, 100),
        username,
        email: String(profile.email).toLowerCase(),
        authProvider: "google",
        providerId: profile.sub,
        profilePicture: String(profile.picture || "").slice(0, 300),
      });
    }

    const accessToken = createAccessToken(user);
    response.append("Set-Cookie", serializeCookie(ACCESS_COOKIE, accessToken, { maxAge: getAccessTokenMaxAge(accessToken) }));
    return response.redirect(`${getClientOrigin()}/?oauth=success`);
  } catch (_error) {
    return response.redirect(`${getClientOrigin()}/?oauth=failed`);
  }
}

function logout(_request, response) {
  response.append("Set-Cookie", serializeCookie(ACCESS_COOKIE, "", { maxAge: 0 }));
  return response.status(204).end();
}

module.exports = { googleCallback, logout, startGoogleAuth };
