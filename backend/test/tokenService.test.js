const jwt = require("jsonwebtoken");
const { createAccessToken, getAccessTokenMaxAge } = require("../services/tokenService");

describe("access token lifecycle", () => {
  const originalSecret = process.env.JWT_SECRET;
  const originalExpiry = process.env.JWT_EXPIRES_IN;

  beforeEach(() => {
    process.env.JWT_SECRET = "test-secret-that-is-long-enough-for-signing";
    process.env.JWT_EXPIRES_IN = "2h";
  });

  afterAll(() => {
    if (originalSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = originalSecret;
    if (originalExpiry === undefined) delete process.env.JWT_EXPIRES_IN;
    else process.env.JWT_EXPIRES_IN = originalExpiry;
  });

  test("signs for the configured subject and expires in the configured window", () => {
    const token = createAccessToken({ id: "0123456789abcdef01234567", username: "researcher", role: "student" });
    const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    expect(payload.sub).toBe("0123456789abcdef01234567");
    expect(payload.username).toBe("researcher");
    expect(payload.role).toBe("student");
    expect(getAccessTokenMaxAge(token)).toBeGreaterThan(7100);
    expect(getAccessTokenMaxAge(token)).toBeLessThanOrEqual(7200);
  });
});
