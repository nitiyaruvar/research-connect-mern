const express = require("express");
const { getDashboard } = require("../controllers/adminController");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();
router.get("/dashboard", requireAuth, requireRole("admin"), getDashboard);

module.exports = router;
