const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");

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

app.use((_request, response) => {
  response.status(404).json({ message: "Route not found" });
});

module.exports = app;
