const mongoose = require("mongoose");

async function connectDatabase(uri = process.env.MONGODB_URI) {
  if (!uri) {
    throw new Error("MONGODB_URI is required. Copy .env.example to .env and configure MongoDB.");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: Number(process.env.MONGODB_TIMEOUT_MS) || 10000,
  });
  return mongoose.connection;
}

module.exports = connectDatabase;
