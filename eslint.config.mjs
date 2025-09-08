import eslint from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import reactEslint from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import path from "path";
import tseslint from "typescript-eslint";
import url from "url";

const __filename = url.fileURLToPath(new URL(import.meta.url));
const __dirname = path.dirname(__filename);

const commonRules = {
  curly: ["warn", "multi-line"],
  eqeqeq: "warn",
  "no-throw-literal": "warn",
  semi: "warn",
  "@typescript-eslint/naming-convention": "off",
  "@typescript-eslint/no-empty-object-type": "off",
  "@typescript-eslint/no-unused-vars": "off",
  "@typescript-eslint/consistent-type-imports": "warn",
  "@typescript-eslint/no-floating-promises": "error",
  "@typescript-eslint/no-misused-promises": "error",
};

const commonTsConfig = {
  parser: tsParser,
  ecmaVersion: 2022,
  sourceType: "module",
  parserOptions: {
    tsconfigRootDir: __dirname,
    ecmaVersion: 2022,
    sourceType: "module",
    project: "./tsconfig.json",
    ecmaFeatures: {
      jsx: true,
    },
  },
};

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ["dist", "**/*.d.ts"],
  },
  {
    // JavaScript scripts - these are run by nodejs.
    files: ["eslint.config.mjs"],
    languageOptions: {
      ...commonTsConfig,
      globals: globals.node,
      "@typescript-eslint/naming-convention": "off",
    },
    rules: {
      ...commonRules,
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    // TypeScript scripts - these are run by nodejs.
    files: ["build.ts"],
    languageOptions: {
      ...commonTsConfig,
      globals: globals.node,
    },
    rules: {
      ...commonRules,
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    // Browser/React TypeScript
    files: ["src/**/*.{ts,tsx}", "examples/**/*.{ts,tsx}"],
    ...reactEslint.configs.flat.recommended,
    ...reactEslint.configs.flat["jsx-runtime"],
    plugins: {
      react: reactEslint,
      "react-hooks": reactHooks,
    },
    languageOptions: {
      ...commonTsConfig,
      globals: globals.browser,
      parserOptions: {
        ...commonTsConfig.parserOptions,
        project: "tsconfig.json",
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...commonRules,
      "@typescript-eslint/naming-convention": [
        "warn",
        {
          selector: "function",
          format: ["camelCase", "PascalCase"],
        },
      ],
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  }
);
