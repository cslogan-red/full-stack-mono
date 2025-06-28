import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  globalIgnores([
    "**/dist",
    "**/build",
    "**/node_modules",
    "**/jest.config.js",
    "**/eslint.config.mjs",
    "**/coverage",
    "**/run.js",
  ]),
  {
    extends: compat.extends(
      "plugin:@typescript-eslint/recommended",
      "prettier",
      "plugin:prettier/recommended",
    ),

    languageOptions: {
      globals: {
        ...globals.node,
      },

      ecmaVersion: 6,
      sourceType: "module",

      parserOptions: {
        project: "tsconfig.json",
        tsconfigRootDir: ".",
      },
    },

    rules: {
      "max-len": ["error", 120, 2],
      "import/prefer-default-export": 0,
    },
  },
]);
