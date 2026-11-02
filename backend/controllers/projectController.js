const Project = require("../models/Project");
const CollaborationRequest = require("../models/CollaborationRequest");
const { escapeRegex, isValidId, paginationFrom } = require("../utils/query");

async function listProjects(request, response) {
  const { page, limit, skip } = paginationFrom(request.query);
  const filter = {};
  const search = String(request.query.search || "").trim().slice(0, 100);
  const status = String(request.query.status || "").trim();
  const department = String(request.query.department || "").trim().slice(0, 120);

  if (search) {
    const expression = new RegExp(escapeRegex(search), "i");
    filter.$or = [
      { title: expression },
      { summary: expression },
      { description: expression },
      { researchAreas: expression },
      { keywords: expression },
    ];
  }
  if (["seeking-collaborators", "active", "completed"].includes(status)) filter.status = status;
  if (department) filter.department = new RegExp(`^${escapeRegex(department)}$`, "i");

  const [projects, total] = await Promise.all([
    Project.find(filter)
      .select("title summary status department researchAreas keywords owner collaborators startDate endDate createdAt updatedAt")
      .populate("owner", "name username department institution profilePicture")
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Project.countDocuments(filter),
  ]);

  response.json({ data: projects, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}

async function getProject(request, response) {
  if (!isValidId(request.params.id)) return response.status(400).json({ message: "Invalid project id" });
  const project = await Project.findById(request.params.id)
    .populate("owner", "name username department institution profilePicture")
    .populate("collaborators", "name username department institution profilePicture")
    .lean();
  if (!project) return response.status(404).json({ message: "Project not found" });
  response.json({ data: project });
}

async function createProject(request, response) {
  const project = await Project.create({ ...request.validatedBody, owner: request.user.id });
  await project.populate("owner", "name username department institution profilePicture");
  response.status(201).json({ data: project });
}

async function updateProject(request, response) {
  const nextStart = Object.hasOwn(request.validatedBody, "startDate") ? request.validatedBody.startDate : request.project.startDate;
  const nextEnd = Object.hasOwn(request.validatedBody, "endDate") ? request.validatedBody.endDate : request.project.endDate;
  if (nextStart && nextEnd && nextEnd < nextStart) {
    return response.status(400).json({ message: "End date cannot be before start date" });
  }
  const project = await Project.findByIdAndUpdate(request.project.id, request.validatedBody, {
    new: true,
    runValidators: true,
  }).populate("owner", "name username department institution profilePicture");
  response.json({ data: project });
}

async function deleteProject(request, response) {
  await CollaborationRequest.updateMany({ project: request.project.id }, { $set: { project: null } });
  await request.project.deleteOne();
  response.status(204).end();
}

module.exports = { createProject, deleteProject, getProject, listProjects, updateProject };
