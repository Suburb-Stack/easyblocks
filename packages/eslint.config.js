import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import unusedImports from "eslint-plugin-unused-imports";
import eslintConfigPrettier from "eslint-config-prettier";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    plugins: {
      "react-hooks": reactHooks,
      "unused-imports": unusedImports,
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        // Browser globals
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        requestAnimationFrame: "readonly",
        cancelAnimationFrame: "readonly",
        fetch: "readonly",
        HTMLElement: "readonly",
        HTMLDivElement: "readonly",
        MouseEvent: "readonly",
        KeyboardEvent: "readonly",
        Event: "readonly",
        CustomEvent: "readonly",
        MutationObserver: "readonly",
        ResizeObserver: "readonly",
        IntersectionObserver: "readonly",
        // Node globals
        process: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        module: "readonly",
        require: "readonly",
        Buffer: "readonly",
        // Jest globals
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        jest: "readonly",
      },
    },
    rules: {
      "no-constant-condition": ["error", { checkLoops: false }],
      "no-empty-function": "off",
      "no-prototype-builtins": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/ban-ts-comment": ["warn"],
      "unused-imports/no-unused-imports": "error",
      ...reactHooks.configs.recommended.rules,
    },
  },
  {
    ignores: ["**/dist/**", "**/node_modules/**", "**/*.d.ts"],
  },
);
