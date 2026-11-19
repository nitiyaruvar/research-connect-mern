const express = require("express");
const { getProjects, createProject, updateProject, deleteProject } = require("../controllers/projectController");
const requireAuth = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);
router.route("/").get(getProjects).post(createProject);
router.route("/:id").put(updateProject).delete(deleteProject);

module.exports = router;