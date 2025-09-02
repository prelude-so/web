// @ts-check

import eslint from "@eslint/js";
import eslintPluginPrettier from "eslint-plugin-prettier";
import tseslint from "typescript-eslint";

export default tseslint.config([
  {
    name: "repo/ignores",
    ignores: ["dist", "scripts", "node_modules", "pkg", "webpack.*.cjs"],
  },
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  {
    name: "repo/typescript",
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/prefer-literal-enum-member": ["error", { allowBitwiseExpressions: true }],
      "prettier/prettier": "error",
    },
  },
]);
