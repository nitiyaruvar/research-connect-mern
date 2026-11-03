const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const mongoose = require("mongoose");
const request = require("supertest");

const uploadDirectory = path.join(os.tmpdir(), `research-connect-test-${process.pid}`);
process.env.UPLOAD_DIR = uploadDirectory;
process.env.JWT_SECRET = "integration-test-secret-with-more-than-32-characters";
process.env.CLIENT_ORIGIN = "http://localhost:5173";

const mongoUri = process.env.MONGODB_URI || "";
const databaseName = mongoUri.split("?")[0].replace(/\/$/, "").split("/").pop() || "";
if (mongoUri && !/(?:^|[_-])test(?:[_-]|$)/i.test(databaseName)) {
  throw new Error("Integration tests require an isolated MongoDB database with 'test' in its name; refusing to use another database.");
}

const app = require("../app");
const User = require("../models/User");
const Project = require("../models/Project");

const integration = mongoUri ? describe : describe.skip;

function validRegistration(suffix) {
  return {
    name: `Researcher ${suffix}`,
    username: `researcher_${suffix}`,
    email: `researcher_${suffix}@example.edu`,
    password: "Strong-Password-123",
  };
}

function authCookie(response) {
  return response.headers["set-cookie"][0].split(";")[0];
}

integration("MongoDB-backed user workflows", () => {
  let firstUser;
  let firstCookie;
  let secondUser;
  let secondCookie;

  beforeAll(async () => {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    await mongoose.connection.dropDatabase();
    await Promise.all([User.init(), Project.init()]);
  }, 15000);

  afterAll(async () => {
    await mongoose.disconnect();
    await fs.rm(uploadDirectory, { recursive: true, force: true });
  });

  test("registers users with HttpOnly cookies and keeps passwords private", async () => {
    const first = await request(app).post("/api/auth/register?session=cookie").send(validRegistration("one"));
    expect(first.status).toBe(201);
    expect(first.headers["set-cookie"][0]).toMatch(/HttpOnly/);
    expect(first.headers["set-cookie"][0]).toMatch(/SameSite=Lax/);
    expect(first.body.data.user.password).toBeUndefined();
    expect(first.body.data.token).toBeUndefined();
    firstUser = first.body.data.user;
    firstCookie = authCookie(first);

    const second = await request(app).post("/api/auth/register?session=cookie").send(validRegistration("two"));
    expect(second.status).toBe(201);
    secondUser = second.body.data.user;
    secondCookie = authCookie(second);
  });

  test("supports cookie-only browser login and token responses for API clients", async () => {
    const browserLogin = await request(app)
      .post("/api/auth/login?session=cookie")
      .send({ identity: "researcher_one", password: "Strong-Password-123" });
    expect(browserLogin.status).toBe(200);
    expect(browserLogin.body.data.token).toBeUndefined();
    expect(browserLogin.headers["set-cookie"][0]).toMatch(/HttpOnly/);

    const apiLogin = await request(app)
      .post("/api/auth/login")
      .send({ identity: "researcher_one", password: "Strong-Password-123" });
    expect(apiLogin.status).toBe(200);
    expect(typeof apiLogin.body.data.token).toBe("string");
  });

  test("creates, lists, and updates an owned project; blocks another user's edit", async () => {
    const created = await request(app)
      .post("/api/projects")
      .set("Cookie", firstCookie)
      .send({ title: "Urban heat", summary: "Map neighborhood heat", description: "A cross-disciplinary mapping project", researchAreas: ["Climate research"] });
    expect(created.status).toBe(201);
    const projectId = created.body.data._id;

    const forbidden = await request(app)
      .put(`/api/projects/${projectId}`)
      .set("Cookie", secondCookie)
      .send({ status: "active" });
    expect(forbidden.status).toBe(403);

    const updated = await request(app)
      .put(`/api/projects/${projectId}`)
      .set("Cookie", firstCookie)
      .send({ status: "active" });
    expect(updated.status).toBe(200);
    expect(updated.body.data.status).toBe("active");

    const listed = await request(app).get("/api/projects?page=1&limit=6");
    expect(listed.body.data.some((project) => project._id === projectId)).toBe(true);
  });

  test("handles collaboration acceptance and requester withdrawal", async () => {
    const project = await Project.findOne({ owner: firstUser._id });
    const created = await request(app)
      .post("/api/collaborations")
      .set("Cookie", secondCookie)
      .send({ recipientId: firstUser._id, projectId: project._id, message: "I can contribute climate data analysis." });
    expect(created.status).toBe(201);

    const accepted = await request(app)
      .patch(`/api/collaborations/${created.body.data._id}`)
      .set("Cookie", firstCookie)
      .send({ status: "accepted" });
    expect(accepted.status).toBe(200);
    expect(accepted.body.data.status).toBe("accepted");
    const updatedProject = await Project.findById(project._id).lean();
    expect(updatedProject.collaborators.map(String)).toContain(String(secondUser._id));

    const pending = await request(app)
      .post("/api/collaborations")
      .set("Cookie", secondCookie)
      .send({ recipientId: firstUser._id, message: "I'd also like to discuss a separate idea." });
    const withdrawn = await request(app)
      .patch(`/api/collaborations/${pending.body.data._id}`)
      .set("Cookie", secondCookie)
      .send({ status: "withdrawn" });
    expect(withdrawn.status).toBe(200);
    expect(withdrawn.body.data.status).toBe("withdrawn");
  });

  test("uploads, attaches, lists, and safely deletes a file", async () => {
    const pngSignature = Buffer.from("89504e470d0a1a0a00", "hex").toString("base64");
    const uploaded = await request(app)
      .post("/api/uploads")
      .set("Cookie", firstCookie)
      .send({ originalName: "research.png", dataUrl: `data:image/png;base64,${pngSignature}` });
    expect(uploaded.status).toBe(201);

    const project = await Project.findOne({ owner: firstUser._id });
    const attached = await request(app)
      .put(`/api/projects/${project._id}`)
      .set("Cookie", firstCookie)
      .send({ attachments: [uploaded.body.data.url] });
    expect(attached.status).toBe(200);

    const fileList = await request(app).get("/api/uploads").set("Cookie", firstCookie);
    expect(fileList.body.data).toHaveLength(1);
    const blockedDelete = await request(app)
      .delete(`/api/uploads/${uploaded.body.data.id}`)
      .set("Cookie", firstCookie);
    expect(blockedDelete.status).toBe(409);

    await request(app).put(`/api/projects/${project._id}`).set("Cookie", firstCookie).send({ attachments: [] });
    const deleted = await request(app)
      .delete(`/api/uploads/${uploaded.body.data.id}`)
      .set("Cookie", firstCookie);
    expect(deleted.status).toBe(204);
  });
});
