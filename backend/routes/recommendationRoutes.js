const express = require("express");
const { recommendCollaborators } = require("../controllers/recommendationController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.post("/", requireAuth, recommendCollaborators);

module.exports = router;
