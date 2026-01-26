import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  transform: {
    "\\.[jt]sx?$": ["babel-jest", { rootMode: "upward" }],
  },
  testEnvironment: "jsdom",
  moduleNameMapper: {
    // Map @easyblocks/core packages to source files for proper mocking support
    "^@easyblocks/core/_internals$": "<rootDir>/../core/src/_internals.ts",
    "^@easyblocks/core$": "<rootDir>/../core/src/index.ts",
  },
  setupFiles: ["<rootDir>/jest.setup.ts"],
};

export default config;
