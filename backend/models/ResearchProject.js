const mongoose = require("mongoose");

const researchProjectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    researchAreas: {
      type: [String],
      required: true,
      validate: {
        validator: (areas) => areas.length > 0,
        message: "At least one research area is required",
      },
    },
    status: {
      type: String,
      enum: ["planning", "active", "completed", "archived"],
      default: "planning",
    },
    startDate: Date,
    endDate: Date,
    outcomes: { type: String, maxlength: 3000 },
  },
  { timestamps: true }
);

researchProjectSchema.index({ researchAreas: 1, status: 1 });
researchProjectSchema.index({ owner: 1 });

module.exports = mongoose.model("ResearchProject", researchProjectSchema);