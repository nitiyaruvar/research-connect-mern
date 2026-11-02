const request = require("supertest");
const app = require("../app");

describe("Research Connect API", () => {
  test("health endpoint reports service and database state", async () => {
    const response = await request(app).get("/api/health");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "ok",
      service: "research-connect-api",
      database: "disconnected",
    });
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
});
