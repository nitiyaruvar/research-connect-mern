const express = require("express");
const { createProject, getProject, listProjects } = require("../controllers/projectController");
const { requireAuth } = require("../middleware/auth");
const { validateProjectInput } = require("../validators/projectValidator");

const router = express.Router();
router.get("/", listProjects);
router.get("/:id", getProject);
router.post("/", requireAuth, validateProjectInput, createProject);

module.exports = router;
