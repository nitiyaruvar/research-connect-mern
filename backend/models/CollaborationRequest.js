const mongoose = require("mongoose");

const collaborationRequestSchema = new mongoose.Schema(
  {
    requester: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    status: { type: String, enum: ["pending", "accepted", "declined", "withdrawn"], default: "pending" },
    respondedAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false },
);

collaborationRequestSchema.index({ requester: 1, createdAt: -1 });
collaborationRequestSchema.index({ recipient: 1, status: 1, createdAt: -1 });
collaborationRequestSchema.index({ project: 1, createdAt: -1 });

module.exports = mongoose.model("CollaborationRequest", collaborationRequestSchema);
