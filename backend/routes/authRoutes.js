const express = require("express");
const { currentUser, deleteCurrentUser, login, register, updateCurrentUser } = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");
const { validateLogin, validateRegistration } = require("../validators/authValidator");
const { validateProfileUpdate } = require("../validators/profileValidator");
const { googleCallback, logout, startGoogleAuth } = require("../controllers/oauthController");
const { createRateLimiter } = require("../middleware/rateLimit");

const router = express.Router();
const credentialLimiter = createRateLimiter({ max: 10, message: "Too many sign-in attempts. Wait 15 minutes and try again." });
const registrationLimiter = createRateLimiter({ max: 5, message: "Too many account creation attempts. Wait 15 minutes and try again." });
const oauthLimiter = createRateLimiter({ max: 10, message: "Too many sign-in attempts. Wait 15 minutes and try again." });
router.post("/register", registrationLimiter, validateRegistration, register);
router.post("/login", credentialLimiter, validateLogin, login);
router.get("/me", requireAuth, currentUser);
router.put("/me", requireAuth, validateProfileUpdate, updateCurrentUser);
router.delete("/me", requireAuth, deleteCurrentUser);
router.get("/google", oauthLimiter, startGoogleAuth);
router.get("/google/callback", googleCallback);
router.post("/logout", logout);

module.exports = router;
