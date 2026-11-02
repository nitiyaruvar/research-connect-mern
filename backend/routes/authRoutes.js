const express = require("express");
const { currentUser, login, register } = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");
const { validateLogin, validateRegistration } = require("../validators/authValidator");

const router = express.Router();
router.post("/register", validateRegistration, register);
router.post("/login", validateLogin, login);
router.get("/me", requireAuth, currentUser);

module.exports = router;
