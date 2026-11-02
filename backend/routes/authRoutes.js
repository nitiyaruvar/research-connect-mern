const express = require("express");
const { currentUser, deleteCurrentUser, login, register, updateCurrentUser } = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");
const { validateLogin, validateRegistration } = require("../validators/authValidator");
const { validateProfileUpdate } = require("../validators/profileValidator");
const { googleCallback, logout, startGoogleAuth } = require("../controllers/oauthController");

const router = express.Router();
router.post("/register", validateRegistration, register);
router.post("/login", validateLogin, login);
router.get("/me", requireAuth, currentUser);
router.put("/me", requireAuth, validateProfileUpdate, updateCurrentUser);
router.delete("/me", requireAuth, deleteCurrentUser);
router.get("/google", startGoogleAuth);
router.get("/google/callback", googleCallback);
router.post("/logout", logout);

module.exports = router;
