const CollaborationRequest = require("../models/CollaborationRequest");
const Project = require("../models/Project");
const User = require("../models/User");

async function createCollaborationRequest(request, response) {
  const { recipientId, projectId, message } = request.validatedBody;
  if (recipientId === request.user.id) return response.status(400).json({ message: "You cannot send a request to yourself" });
  const [recipient, project] = await Promise.all([
    User.findById(recipientId).select("_id"),
    projectId ? Project.findById(projectId).select("_id owner") : Promise.resolve(null),
  ]);
  if (!recipient) return response.status(404).json({ message: "Researcher not found" });
  if (projectId && !project) return response.status(404).json({ message: "Project not found" });
  if (project && String(project.owner) !== recipientId) return response.status(400).json({ message: "The project owner must be the recipient" });

  const existing = await CollaborationRequest.findOne({
    requester: request.user.id,
    recipient: recipientId,
    project: projectId || null,
    status: "pending",
  }).select("_id");
  if (existing) return response.status(409).json({ message: "A pending request already exists" });

  const collaborationRequest = await CollaborationRequest.create({
    requester: request.user.id,
    recipient: recipientId,
    project: projectId,
    message,
  });
  await collaborationRequest.populate([
    { path: "requester", select: "name username department profilePicture" },
    { path: "recipient", select: "name username department profilePicture" },
    { path: "project", select: "title status" },
  ]);
  response.status(201).json({ data: collaborationRequest });
}

async function updateCollaborationRequest(request, response) {
  const { status } = request.body || {};
  if (!request.isRequester && !["accepted", "declined"].includes(status)) {
    return response.status(400).json({ message: "Recipients can accept or decline a pending request" });
  }
  if (request.isRequester && status !== "withdrawn" && request.user.role !== "admin") {
    return response.status(400).json({ message: "Requesters can withdraw a pending request" });
  }
  if (request.user.role === "admin" && !["accepted", "declined", "withdrawn"].includes(status)) {
    return response.status(400).json({ message: "Status is not supported" });
  }
  if (request.collaborationRequest.status !== "pending") {
    return response.status(409).json({ message: "This request has already been answered" });
  }
  request.collaborationRequest.status = status;
  request.collaborationRequest.respondedAt = new Date();
  await request.collaborationRequest.save();
  await request.collaborationRequest.populate([
    { path: "requester", select: "name username department profilePicture" },
    { path: "recipient", select: "name username department profilePicture" },
    { path: "project", select: "title status" },
  ]);
  response.json({ data: request.collaborationRequest });
}

async function deleteCollaborationRequest(request, response) {
  if (!request.isRequester && request.user.role !== "admin") {
    return response.status(403).json({ message: "Only the requester can remove this request" });
  }
  await request.collaborationRequest.deleteOne();
  response.status(204).end();
}

module.exports = { createCollaborationRequest, deleteCollaborationRequest, updateCollaborationRequest };
