const express = require("express");
const { createCollaborationRequest } = require("../controllers/collaborationController");
const { requireAuth } = require("../middleware/auth");
const { validateCollaborationInput } = require("../validators/collaborationValidator");

const router = express.Router();
router.post("/", requireAuth, validateCollaborationInput, createCollaborationRequest);

module.exports = router;
