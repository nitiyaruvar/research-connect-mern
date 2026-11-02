const { escapeRegex, paginationFrom } = require("../utils/query");

describe("query helpers", () => {
  test("pagination applies defaults and caps page size", () => {
    expect(paginationFrom({})).toEqual({ page: 1, limit: 12, skip: 0 });
    expect(paginationFrom({ page: "3", limit: "200" })).toEqual({ page: 3, limit: 50, skip: 100 });
  });

  test("pagination does not accept negative or invalid values", () => {
    expect(paginationFrom({ page: "-5", limit: "invalid" })).toEqual({ page: 1, limit: 12, skip: 0 });
  });

  test("regex input is escaped before being used in search filters", () => {
    expect(escapeRegex("research (AI)+")).toBe("research \\(AI\\)\\+");
  });
});
