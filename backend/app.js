const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const projectRoutes = require("./routes/projectRoutes");
const collaborationRoutes = require("./routes/collaborationRoutes");
const authRoutes = require("./routes/authRoutes");
const researcherRoutes = require("./routes/researcherRoutes");
const { errorHandler, notFound } = require("./middleware/errorHandler");

const app = express();
const configuredOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable("x-powered-by");
app.use(cors({ origin: configuredOrigins, credentials: true }));
app.use(express.json({ limit: "6mb" }));
app.use(express.urlencoded({ extended: false, limit: "6mb" }));

app.get("/api/health", (_request, response) => {
  response.status(200).json({
    status: "ok",
    service: "research-connect-api",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.use("/api/researchers", researcherRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/collaborations", collaborationRoutes);
app.use("/api/auth", authRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
