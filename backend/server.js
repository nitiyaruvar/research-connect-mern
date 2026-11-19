const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDatabase = require("./config/database");
const User = require("./models/User");
const ResearchProject = require("./models/ResearchProject");
const CollaborationRequest = require("./models/CollaborationRequest");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const projectRoutes = require("./routes/projectRoutes");
const collaborationRequestRoutes = require("./routes/collaborationRequestRoutes");

const app = express();

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((origin) => origin.trim()).filter(Boolean)
  : null;

app.use(cors(allowedOrigins ? { origin: allowedOrigins } : undefined));
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/collaboration-requests", collaborationRequestRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Research Connect Backend Running",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    message: "API is healthy",
    models: [User.modelName, ResearchProject.modelName, CollaborationRequest.modelName],
  });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDatabase();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  });
}

module.exports = app;