const mongoose = require("mongoose");

const collaborationRequestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "ResearchProject" },
    message: { type: String, required: true, trim: true, maxlength: 1000 },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

collaborationRequestSchema.index({ sender: 1, recipient: 1, status: 1 });

module.exports = mongoose.model(
  "CollaborationRequest",
  collaborationRequestSchema
);