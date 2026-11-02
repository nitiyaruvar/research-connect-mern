const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");
const Project = require("../models/Project");
const UploadedFile = require("../models/UploadedFile");
const User = require("../models/User");
const { isValidId } = require("../utils/query");

const fileTypes = {
  "image/png": { extension: ".png", signature: (data) => data.subarray(0, 8).equals(Buffer.from("89504e470d0a1a0a", "hex")) },
  "image/jpeg": { extension: ".jpg", signature: (data) => data.length > 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff },
  "image/webp": { extension: ".webp", signature: (data) => data.toString("ascii", 0, 4) === "RIFF" && data.toString("ascii", 8, 12) === "WEBP" },
  "application/pdf": { extension: ".pdf", signature: (data) => data.toString("ascii", 0, 5) === "%PDF-" },
};

function getUploadDirectory() {
  return process.env.UPLOAD_DIR ? path.resolve(process.env.UPLOAD_DIR) : path.join(__dirname, "..", "uploads");
}

function safeOriginalName(name) {
  return path.basename(String(name || "file")).replace(/[\r\n\0]/g, "").slice(0, 120) || "file";
}

async function createUpload(request, response) {
  const dataUrl = typeof request.body?.dataUrl === "string" ? request.body.dataUrl : "";
  const match = dataUrl.match(/^data:(image\/png|image\/jpeg|image\/webp|application\/pdf);base64,([A-Za-z0-9+/]+={0,2})$/);
  if (!match) return response.status(400).json({ message: "Upload a PNG, JPEG, WebP, or PDF file" });
  const [, mimeType, encoded] = match;
  const content = Buffer.from(encoded, "base64");
  const maxBytes = Math.min(10 * 1024 * 1024, Number(process.env.MAX_UPLOAD_BYTES) || 5 * 1024 * 1024);
  if (content.length === 0 || content.length > maxBytes || content.toString("base64") !== encoded) {
    return response.status(400).json({ message: `File must be between 1 byte and ${maxBytes} bytes` });
  }
  if (!fileTypes[mimeType].signature(content)) return response.status(400).json({ message: "File content does not match its declared type" });

  const storageName = `${crypto.randomUUID()}${fileTypes[mimeType].extension}`;
  const url = `/uploads/${storageName}`;
  const directory = getUploadDirectory();
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(path.join(directory, storageName), content, { flag: "wx", mode: 0o644 });
  try {
    const file = await UploadedFile.create({
      owner: request.user.id,
      storageName,
      originalName: safeOriginalName(request.body.originalName),
      mimeType,
      size: content.length,
      url,
    });
    response.status(201).json({ data: { id: file.id, originalName: file.originalName, mimeType, size: file.size, url } });
  } catch (error) {
    await fs.unlink(path.join(directory, storageName)).catch(() => {});
    throw error;
  }
}

async function deleteUpload(request, response) {
  if (!isValidId(request.params.id)) return response.status(400).json({ message: "Invalid file id" });
  const file = await UploadedFile.findById(request.params.id);
  if (!file) return response.status(404).json({ message: "File not found" });
  if (String(file.owner) !== request.user.id && request.user.role !== "admin") {
    return response.status(403).json({ message: "You do not have permission to remove this file" });
  }
  const [profileUse, projectUse] = await Promise.all([
    User.exists({ profilePicture: file.url }),
    Project.exists({ attachments: file.url }),
  ]);
  if (profileUse || projectUse) return response.status(409).json({ message: "Remove this file from the profile or project before deleting it" });
  await fs.unlink(path.join(getUploadDirectory(), file.storageName)).catch((error) => {
    if (error.code !== "ENOENT") throw error;
  });
  await file.deleteOne();
  response.status(204).end();
}

module.exports = { createUpload, deleteUpload };
