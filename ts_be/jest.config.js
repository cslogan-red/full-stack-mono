module.exports = {
  preset: "ts-jest",
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/build/", "/coverage/", "/testData.ts"],
  clearMocks: true,
  // Setup Coverlay reporting
  coverageReporters: ["text", "cobertura", "html"],
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
};
