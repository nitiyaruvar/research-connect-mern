const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    summary: { type: String, required: true, trim: true, maxlength: 320 },
    description: { type: String, required: true, trim: true, maxlength: 8000 },
    status: { type: String, enum: ["seeking-collaborators", "active", "completed"], default: "seeking-collaborators" },
    department: { type: String, trim: true, maxlength: 120, default: "" },
    researchAreas: { type: [String], default: [] },
    keywords: { type: [String], default: [] },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    startDate: { type: Date },
    endDate: { type: Date },
    attachments: [{ type: String }],
  },
  { timestamps: true, versionKey: false },
);

projectSchema.index({ title: "text", summary: "text", description: "text", researchAreas: "text", keywords: "text" });
projectSchema.index({ status: 1, createdAt: -1 });
projectSchema.index({ owner: 1, createdAt: -1 });

module.exports = mongoose.model("Project", projectSchema);
