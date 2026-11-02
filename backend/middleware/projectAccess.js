const Project = require("../models/Project");
const { isValidId } = require("../utils/query");

async function requireProjectOwner(request, response, next) {
  if (!isValidId(request.params.id)) return response.status(400).json({ message: "Invalid project id" });
  const project = await Project.findById(request.params.id);
  if (!project) return response.status(404).json({ message: "Project not found" });
  if (String(project.owner) !== request.user.id && request.user.role !== "admin") {
    return response.status(403).json({ message: "You do not have permission to change this project" });
  }
  request.project = project;
  return next();
}

module.exports = { requireProjectOwner };
