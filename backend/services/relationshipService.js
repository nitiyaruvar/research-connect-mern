const CollaborationRequest = require("../models/CollaborationRequest");
const Project = require("../models/Project");
const UploadedFile = require("../models/UploadedFile");
const User = require("../models/User");
const fs = require("node:fs/promises");
const path = require("node:path");

async function removeUserRelationships(userId) {
  const ownedProjects = await Project.find({ owner: userId }).select("_id").lean();
  const projectIds = ownedProjects.map((project) => project._id);
  const ownedFiles = await UploadedFile.find({ owner: userId }).select("storageName url").lean();
  const fileUrls = ownedFiles.map((file) => file.url);
  const uploadDirectory = process.env.UPLOAD_DIR ? path.resolve(process.env.UPLOAD_DIR) : path.join(__dirname, "..", "uploads");
  await Promise.all([
    Project.deleteMany({ _id: { $in: projectIds } }),
    Project.updateMany({ collaborators: userId }, { $pull: { collaborators: userId } }),
    Project.updateMany({ attachments: { $in: fileUrls } }, { $pull: { attachments: { $in: fileUrls } } }),
    User.updateMany({ _id: { $ne: userId }, profilePicture: { $in: fileUrls } }, { $set: { profilePicture: "" } }),
    CollaborationRequest.deleteMany({
      $or: [
        { requester: userId },
        { recipient: userId },
        { project: { $in: projectIds } },
      ],
    }),
    UploadedFile.deleteMany({ owner: userId }),
  ]);
  await Promise.all(ownedFiles.map((file) => {
    if (!/^[a-f\d-]{36}\.(png|jpg|webp|pdf)$/i.test(file.storageName)) return Promise.resolve();
    return fs.unlink(path.join(uploadDirectory, file.storageName)).catch((error) => {
      if (error.code !== "ENOENT") throw error;
    });
  }));
}

module.exports = { removeUserRelationships };
