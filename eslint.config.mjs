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
  "@typescript-eslint/naming-convention": "warn",
  curly: ["warn", "multi-line"],
  eqeqeq: "warn",
  "no-throw-literal": "warn",
  semi: "warn",
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
    // Build scripts config - these are run by nodejs.
    files: ["build.ts", "eslint.config.mjs"],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    // CommonJS Node.js scripts in bin/
    files: ["bin/**/*.js"],
    languageOptions: {
      globals: globals.node,
      ecmaVersion: 2022,
      sourceType: "commonjs",
    },
    rules: {
      // Disable TypeScript-specific rules for plain JS files
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    // Browser/React TypeScript
    files: ["src/**/*.{ts,tsx}"],
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
