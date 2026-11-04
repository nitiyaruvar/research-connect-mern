const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");

describe("Research Connect API", () => {
  test("health endpoint reports service liveness", async () => {
    const response = await request(app).get("/api/health");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok", service: "research-connect-api" });
  });

  test("readiness reports whether MongoDB is connected", async () => {
    const response = await request(app).get("/api/ready");
    const connected = mongoose.connection.readyState === 1;
    expect(response.status).toBe(connected ? 200 : 503);
    expect(response.body.database).toBe(connected ? "connected" : "disconnected");
  });

  test("registration rejects weak passwords before database access", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "Researcher",
      username: "researcher_1",
      email: "researcher@example.edu",
      password: "short",
    });
    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/Password must be/);
  });

  test("protected project creation requires a bearer token", async () => {
    const response = await request(app).post("/api/projects").send({ title: "Project" });
    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Sign in to continue");
  });

  test("collaboration inbox requires authentication", async () => {
    const response = await request(app).get("/api/collaborations");
    expect(response.status).toBe(401);
  });

  test("file library requires authentication", async () => {
    const response = await request(app).get("/api/uploads");
    expect(response.status).toBe(401);
  });

  test("admin dashboard requires authentication before role checks", async () => {
    const response = await request(app).get("/api/admin/dashboard");
    expect(response.status).toBe(401);
  });

  test("researcher detail rejects malformed ids without querying the database", async () => {
    const response = await request(app).get("/api/researchers/not-an-object-id");
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid researcher id");
  });

  test("unknown routes return JSON 404 responses", async () => {
    const response = await request(app).get("/api/does-not-exist");
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Route not found");
  });

  test("API responses include baseline security headers", async () => {
    const response = await request(app).get("/api/health");
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["x-frame-options"]).toBe("DENY");
    expect(response.headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  });

  test("state-changing requests reject untrusted browser origins", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .set("Origin", "https://untrusted.example")
      .send({ identity: "researcher", password: "secret" });
    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Request origin is not allowed");
  });

  test("login attempts are rate limited", async () => {
    let response;
    for (let attempt = 0; attempt < 11; attempt += 1) {
      response = await request(app).post("/api/auth/login").send({});
    }
    expect(response.status).toBe(429);
    expect(response.headers["retry-after"]).toBeDefined();
  });
});
