const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const path = require("node:path");
const projectRoutes = require("./routes/projectRoutes");
const collaborationRoutes = require("./routes/collaborationRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const researcherRoutes = require("./routes/researcherRoutes");
const { errorHandler, notFound } = require("./middleware/errorHandler");

const app = express();
const trustedProxyHops = Number(process.env.TRUST_PROXY_HOPS || 0);
app.set("trust proxy", Number.isSafeInteger(trustedProxyHops) && trustedProxyHops > 0 ? trustedProxyHops : 0);
const configuredOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable("x-powered-by");
app.use((request, response, next) => {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "DENY");
  response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (process.env.NODE_ENV === "production") response.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  next();
});
app.use(cors({ origin: configuredOrigins, credentials: true }));
app.use((request, response, next) => {
  const isStateChanging = !["GET", "HEAD", "OPTIONS"].includes(request.method);
  const origin = request.get("origin");
  if (isStateChanging && origin && !configuredOrigins.includes(origin)) {
    return response.status(403).json({ message: "Request origin is not allowed" });
  }
  return next();
});
app.use(express.json({ limit: "14mb" }));
app.use(express.urlencoded({ extended: false, limit: "14mb" }));
const uploadDirectory = process.env.UPLOAD_DIR ? path.resolve(process.env.UPLOAD_DIR) : path.join(__dirname, "uploads");
app.use("/uploads", express.static(uploadDirectory, {
  dotfiles: "deny",
  index: false,
  maxAge: "1h",
  setHeaders(response, filePath) {
    response.setHeader("X-Content-Type-Options", "nosniff");
    if (path.extname(filePath).toLowerCase() === ".pdf") response.setHeader("Content-Disposition", "attachment");
  },
}));

app.get("/api/health", (_request, response) => {
  response.status(200).json({
    status: "ok",
    service: "research-connect-api",
  });
});

app.get("/api/ready", (_request, response) => {
  const databaseReady = mongoose.connection.readyState === 1;
  response.status(databaseReady ? 200 : 503).json({
    status: databaseReady ? "ready" : "not-ready",
    service: "research-connect-api",
    database: databaseReady ? "connected" : "disconnected",
  });
});

app.use("/api/researchers", researcherRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/collaborations", collaborationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
