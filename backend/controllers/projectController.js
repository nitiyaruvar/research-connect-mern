const ResearchProject = require("../models/ResearchProject");

async function getProjects(req, res) {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.researchArea) filter.researchAreas = req.query.researchArea;

    const projects = await ResearchProject.find(filter)
      .populate("owner", "name email department")
      .populate("collaborators", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: "Unable to fetch research projects", error: error.message });
  }
}

async function createProject(req, res) {
  try {
    const project = await ResearchProject.create({ ...req.body, owner: req.user._id });
    const savedProject = await project.populate("owner", "name email department");
    res.status(201).json(savedProject);
  } catch (error) {
    const statusCode = error.name === "ValidationError" || error.name === "CastError" ? 400 : 500;
    res.status(statusCode).json({ message: "Unable to create research project", error: error.message });
  }
}

async function updateProject(req, res) {
  try {
    const existingProject = await ResearchProject.findOne({ _id: req.params.id, owner: req.user._id });
    if (!existingProject) {
      return res.status(404).json({ message: "Research project not found" });
    }

    const project = await ResearchProject.findByIdAndUpdate(req.params.id, { ...req.body, owner: req.user._id }, {
      new: true,
      runValidators: true,
    })
      .populate("owner", "name email department")
      .populate("collaborators", "name email");

    if (!project) {
      return res.status(404).json({ message: "Research project not found" });
    }

    res.status(200).json(project);
  } catch (error) {
    const statusCode = error.name === "ValidationError" || error.name === "CastError" ? 400 : 500;
    res.status(statusCode).json({ message: "Unable to update research project", error: error.message });
  }
}

async function deleteProject(req, res) {
  try {
    const project = await ResearchProject.findOneAndDelete({ _id: req.params.id, owner: req.user._id });

    if (!project) {
      return res.status(404).json({ message: "Research project not found" });
    }

    res.status(200).json({ message: "Research project deleted", id: project._id });
  } catch (error) {
    const statusCode = error.name === "CastError" ? 400 : 500;
    res.status(statusCode).json({ message: "Unable to delete research project", error: error.message });
  }
}

module.exports = { getProjects, createProject, updateProject, deleteProject };