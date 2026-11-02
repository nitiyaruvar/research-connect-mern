require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");
const connectDatabase = require("./config/database");

const port = Number(process.env.PORT) || 5000;

async function startServer() {
  await connectDatabase();
  const server = app.listen(port, () => {
    console.log(`Research Connect API listening on port ${port}`);
  });

  async function shutdown(signal) {
    console.log(`${signal} received; closing API and MongoDB connection.`);
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
  }

  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));
  return server;
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error("Unable to start Research Connect API:", error.message);
    process.exitCode = 1;
  });
}

module.exports = { startServer };
