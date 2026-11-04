const { validateProjectInput, validateProjectUpdate } = require("../validators/projectValidator");

function runValidator(validator, body) {
  const request = { body };
  const response = {
    statusCode: null,
    payload: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.payload = payload; return this; },
  };
  let continued = false;
  validator(request, response, () => { continued = true; });
  return { request, response, continued };
}

describe("project validation", () => {
  test("normalizes a valid project and deduplicates research terms", () => {
    const result = runValidator(validateProjectInput, {
      title: "  Heat mapping  ",
      summary: " A concise project summary ",
      description: " Project detail ",
      researchAreas: ["Climate", "Climate"],
      keywords: ["urban heat"],
      status: "seeking-collaborators",
    });
    expect(result.continued).toBe(true);
    expect(result.request.validatedBody.title).toBe("Heat mapping");
    expect(result.request.validatedBody.researchAreas).toEqual(["Climate"]);
  });

  test("rejects an end date before the start date", () => {
    const result = runValidator(validateProjectInput, {
      title: "Heat mapping", summary: "A concise summary", description: "Details",
      startDate: "2027-02-01", endDate: "2027-01-01",
    });
    expect(result.continued).toBe(false);
    expect(result.response.statusCode).toBe(400);
    expect(result.response.payload.message).toMatch(/End date cannot be before/);
  });

  test("rejects attachment URLs outside generated upload paths", () => {
    const result = runValidator(validateProjectUpdate, { attachments: ["https://untrusted.example/file.pdf"] });
    expect(result.continued).toBe(false);
    expect(result.response.statusCode).toBe(400);
    expect(result.response.payload.message).toMatch(/files uploaded/);
  });

  test("rejects empty updates", () => {
    const result = runValidator(validateProjectUpdate, {});
    expect(result.continued).toBe(false);
    expect(result.response.statusCode).toBe(400);
    expect(result.response.payload.message).toMatch(/at least one field/);
  });
});
