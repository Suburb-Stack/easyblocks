import { Config } from "@suburb-stack/core";

export const debugTokens: Config["tokens"] = {
  debug_urls: [
    {
      id: "google",
      value: "https://google.com",
    },
    {
      id: "bing",
      value: "https://bing.com",
    },
  ],
};
