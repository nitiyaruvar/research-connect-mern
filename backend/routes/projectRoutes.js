const express = require("express");
const { createProject, getProject, listProjects, updateProject } = require("../controllers/projectController");
const { requireAuth } = require("../middleware/auth");
const { requireProjectOwner } = require("../middleware/projectAccess");
const { validateProjectInput, validateProjectUpdate } = require("../validators/projectValidator");

const router = express.Router();
router.get("/", listProjects);
router.get("/:id", getProject);
router.post("/", requireAuth, validateProjectInput, createProject);
router.put("/:id", requireAuth, requireProjectOwner, validateProjectUpdate, updateProject);

module.exports = router;
