const CollaborationRequest = require("../models/CollaborationRequest");
const Project = require("../models/Project");
const User = require("../models/User");
const { paginationFrom } = require("../utils/query");

async function listCollaborationRequests(request, response) {
  const { page, limit, skip } = paginationFrom(request.query);
  const filter = { $or: [{ requester: request.user.id }, { recipient: request.user.id }] };
  const status = String(request.query.status || "");
  if (["pending", "accepted", "declined", "withdrawn"].includes(status)) filter.status = status;
  const [requests, total] = await Promise.all([
    CollaborationRequest.find(filter)
      .populate("requester", "name username department profilePicture")
      .populate("recipient", "name username department profilePicture")
      .populate("project", "title summary status")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    CollaborationRequest.countDocuments(filter),
  ]);
  response.json({ data: requests, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}

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
  const isAdmin = request.user.role === "admin";
  const isRecipient = String(request.collaborationRequest.recipient) === request.user.id;
  const allowed = isAdmin
    ? ["accepted", "declined", "withdrawn"].includes(status)
    : request.isRequester
      ? status === "withdrawn"
      : isRecipient && ["accepted", "declined"].includes(status);
  if (!allowed) {
    if (request.isRequester) return response.status(400).json({ message: "Requesters can withdraw a pending request" });
    if (isRecipient) return response.status(400).json({ message: "Recipients can accept or decline a pending request" });
    return response.status(400).json({ message: "Status is not supported" });
  }

  const updatedRequest = await CollaborationRequest.findOneAndUpdate(
    { _id: request.collaborationRequest._id, status: "pending" },
    { $set: { status, respondedAt: new Date() } },
    { new: true, runValidators: true },
  );
  if (!updatedRequest) {
    return response.status(409).json({ message: "This request has already been answered" });
  }
  if (status === "accepted" && updatedRequest.project) {
    await Project.findByIdAndUpdate(updatedRequest.project, {
      $addToSet: { collaborators: updatedRequest.requester },
    });
  }
  await updatedRequest.populate([
    { path: "requester", select: "name username department profilePicture" },
    { path: "recipient", select: "name username department profilePicture" },
    { path: "project", select: "title status" },
  ]);
  response.json({ data: updatedRequest });
}

async function deleteCollaborationRequest(request, response) {
  if (!request.isRequester && request.user.role !== "admin") {
    return response.status(403).json({ message: "Only the requester can remove this request" });
  }
  await request.collaborationRequest.deleteOne();
  response.status(204).end();
}

module.exports = { createCollaborationRequest, deleteCollaborationRequest, listCollaborationRequests, updateCollaborationRequest };
