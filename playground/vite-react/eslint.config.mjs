// @ts-check

import eslint from "@eslint/js";
import eslintPluginPrettier from "eslint-plugin-prettier";
import eslintPluginReact from "eslint-plugin-react";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config([
  {
    name: "repo/ignores",
    ignores: ["dist", "node_modules", "webpack.*.cjs"],
  },
  {
    name: "envs",
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  eslintPluginReact.configs.flat.recommended,
  eslintPluginReact.configs.flat["jsx-runtime"],
  {
    name: "repo/typescript",
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      "@typescript-eslint/ban-ts-comment": "off",
      "prettier/prettier": "error",
    },
    settings: {
      react: {
        version: "^16.11.0 || ^17 || ^18 || ^19",
      },
    },
  },
]);
