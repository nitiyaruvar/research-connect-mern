const CollaborationRequest = require("../models/CollaborationRequest");
const Project = require("../models/Project");

async function removeUserRelationships(userId) {
  const ownedProjects = await Project.find({ owner: userId }).select("_id").lean();
  const projectIds = ownedProjects.map((project) => project._id);
  await Promise.all([
    Project.deleteMany({ _id: { $in: projectIds } }),
    Project.updateMany({ collaborators: userId }, { $pull: { collaborators: userId } }),
    CollaborationRequest.deleteMany({
      $or: [
        { requester: userId },
        { recipient: userId },
        { project: { $in: projectIds } },
      ],
    }),
  ]);
}

module.exports = { removeUserRelationships };
