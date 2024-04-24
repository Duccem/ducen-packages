const { resolve } = require("node:path");

const project = resolve(process.cwd(), "tsconfig.json");

module.exports = {
  extends: [],
  parserOptions: {
    project,
  },
  globals: {
    JSX: true,
  },
  settings: {
    "import/resolver": {
      typescript: {
        project,
      },
    },
  },
  ignorePatterns: ["node_modules/", "dist/", ".eslintrc.js"],

  rules: {
    // add specific rules configurations here
  },
};
