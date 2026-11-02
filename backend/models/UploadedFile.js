const mongoose = require("mongoose");

const uploadedFileSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    storageName: { type: String, required: true, unique: true },
    originalName: { type: String, required: true, maxlength: 120 },
    mimeType: { type: String, required: true, enum: ["image/png", "image/jpeg", "image/webp", "application/pdf"] },
    size: { type: Number, required: true, min: 1 },
    url: { type: String, required: true, unique: true },
  },
  { timestamps: true, versionKey: false },
);

uploadedFileSchema.index({ owner: 1, createdAt: -1 });

module.exports = mongoose.model("UploadedFile", uploadedFileSchema);
