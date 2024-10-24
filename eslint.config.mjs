import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  { languageOptions: { globals: globals.node } },
  {
    rules: {
      "no-unused-vars": "error",
      "prefer-const": "error",
      "no-unused-expressions": "error",
      "no-undef": "error",
      "no-console": "off",
      // "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      // "@typescript-eslint/explicit-module-boundary-types": "off",
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
];
