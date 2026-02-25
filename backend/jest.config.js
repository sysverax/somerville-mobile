module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/src/test"],
  reporters: [
    "default",
    "<rootDir>/src/test/jest.pass-reporter.js",
  ],
};
