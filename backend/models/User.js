const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    username: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
      match: /^[a-z0-9_]+$/,
    },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    password: { type: String, select: false },
    authProvider: { type: String, enum: ["local", "google"], default: "local" },
    providerId: { type: String, select: false },
    role: { type: String, enum: ["student", "faculty", "admin"], default: "student" },
    department: { type: String, trim: true, maxlength: 120, default: "" },
    institution: { type: String, trim: true, maxlength: 160, default: "" },
    bio: { type: String, trim: true, maxlength: 1200, default: "" },
    researchInterests: { type: [String], default: [] },
    skills: { type: [String], default: [] },
    profilePicture: { type: String, default: "" },
    website: { type: String, trim: true, maxlength: 300, default: "" },
    isOpenToCollaboration: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false },
);

userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ name: "text", department: "text", researchInterests: "text", skills: "text" });
userSchema.set("toJSON", {
  transform(_document, returned) {
    delete returned.password;
    delete returned.providerId;
    return returned;
  },
});

module.exports = mongoose.model("User", userSchema);
