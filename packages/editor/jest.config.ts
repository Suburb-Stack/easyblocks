import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  transform: {
    "\\.[jt]sx?$": ["babel-jest", { rootMode: "upward" }],
  },
  testEnvironment: "jsdom",
  moduleNameMapper: {
    // Map @suburb-stack/core packages to source files for proper mocking support
    "^@suburb-stack/core/_internals$": "<rootDir>/../core/src/_internals.ts",
    "^@suburb-stack/core$": "<rootDir>/../core/src/index.ts",
  },
  setupFiles: ["<rootDir>/jest.setup.ts"],
};

export default config;
