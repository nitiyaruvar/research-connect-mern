const mongoose = require("mongoose");

function validateCollaborationInput(request, response, next) {
  const body = request.body || {};
  const recipientId = String(body.recipientId || "");
  const projectId = body.projectId ? String(body.projectId) : null;
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!mongoose.isValidObjectId(recipientId)) return response.status(400).json({ message: "A valid recipientId is required" });
  if (projectId && !mongoose.isValidObjectId(projectId)) return response.status(400).json({ message: "projectId is invalid" });
  if (!message || message.length > 2000) return response.status(400).json({ message: "Message must contain 1 to 2000 characters" });
  request.validatedBody = { recipientId, projectId, message };
  return next();
}

module.exports = { validateCollaborationInput };
