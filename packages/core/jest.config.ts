import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  transform: {
    "\\.[jt]sx?$": ["babel-jest", { rootMode: "upward" }],
  },
  setupFiles: ["<rootDir>/jest.setup.ts"],
};

export default config;
