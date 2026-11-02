const express = require("express");
const { createCollaborationRequest, deleteCollaborationRequest, listCollaborationRequests, updateCollaborationRequest } = require("../controllers/collaborationController");
const { requireAuth } = require("../middleware/auth");
const { requireCollaborationParticipant } = require("../middleware/collaborationAccess");
const { validateCollaborationInput } = require("../validators/collaborationValidator");

const router = express.Router();
router.get("/", requireAuth, listCollaborationRequests);
router.post("/", requireAuth, validateCollaborationInput, createCollaborationRequest);
router.patch("/:id", requireAuth, requireCollaborationParticipant, updateCollaborationRequest);
router.delete("/:id", requireAuth, requireCollaborationParticipant, deleteCollaborationRequest);

module.exports = router;
