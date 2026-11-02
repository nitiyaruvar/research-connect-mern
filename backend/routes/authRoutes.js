const express = require("express");
const { currentUser, login, register } = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");
const { validateLogin, validateRegistration } = require("../validators/authValidator");
const { googleCallback, logout, startGoogleAuth } = require("../controllers/oauthController");

const router = express.Router();
router.post("/register", validateRegistration, register);
router.post("/login", validateLogin, login);
router.get("/me", requireAuth, currentUser);
router.get("/google", startGoogleAuth);
router.get("/google/callback", googleCallback);
router.post("/logout", logout);

module.exports = router;
