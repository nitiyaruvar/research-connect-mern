const CollaborationRequest = require("../models/CollaborationRequest");
const { isValidId } = require("../utils/query");

async function requireCollaborationParticipant(request, response, next) {
  if (!isValidId(request.params.id)) return response.status(400).json({ message: "Invalid collaboration request id" });
  const record = await CollaborationRequest.findById(request.params.id);
  if (!record) return response.status(404).json({ message: "Collaboration request not found" });
  const userId = request.user.id;
  const isRequester = String(record.requester) === userId;
  const isRecipient = String(record.recipient) === userId;
  if (!isRequester && !isRecipient && request.user.role !== "admin") {
    return response.status(403).json({ message: "You do not have permission to change this request" });
  }
  request.collaborationRequest = record;
  request.isRequester = isRequester;
  return next();
}

module.exports = { requireCollaborationParticipant };
