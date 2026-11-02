const express = require("express");
const { getProject, listProjects } = require("../controllers/projectController");

const router = express.Router();
router.get("/", listProjects);
router.get("/:id", getProject);

module.exports = router;
