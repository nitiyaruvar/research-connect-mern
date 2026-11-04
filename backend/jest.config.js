module.exports = {
  testEnvironment: "node",
  transform: {},
  testMatch: ["<rootDir>/test/**/*.test.js"],
  clearMocks: true,
  collectCoverageFrom: [
    "app.js",
    "controllers/**/*.js",
    "middleware/**/*.js",
    "validators/**/*.js",
    "utils/query.js",
    "!**/test/**",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],
};
