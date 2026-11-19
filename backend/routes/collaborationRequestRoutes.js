const express = require("express");
const {
	createCollaborationRequest,
	getCollaborationRequests,
	updateCollaborationRequest,
} = require("../controllers/collaborationRequestController");
const requireAuth = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);
router.route("/").get(getCollaborationRequests).post(createCollaborationRequest);
router.route("/:id").put(updateCollaborationRequest);

module.exports = router;