const CollaborationRequest = require("../models/CollaborationRequest");
const Project = require("../models/Project");
const User = require("../models/User");

async function getDashboard(_request, response) {
  const [researchers, projects, pendingRequests, collaborations] = await Promise.all([
    User.countDocuments(),
    Project.countDocuments(),
    CollaborationRequest.countDocuments({ status: "pending" }),
    CollaborationRequest.countDocuments({ status: "accepted" }),
  ]);
  response.json({ data: { researchers, projects, pendingRequests, collaborations } });
}

module.exports = { getDashboard };
