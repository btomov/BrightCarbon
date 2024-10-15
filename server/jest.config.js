module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    moduleFileExtensions: ["ts", "js"],
    testMatch: ["**/?(*.)+(test|spec).[tj]s"],
    coverageDirectory: "./coverage",
    collectCoverageFrom: [
      "src/**/*.{ts,js}",
      "!src/**/*.d.ts"
    ],
  };
  