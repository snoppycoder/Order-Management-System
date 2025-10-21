module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Enforce your allowed types at the beginning of the message
    "type-enum": [
      2,
      "always",
      [
        "feature",
        "bug-fix",
        "chore",
        "refactor",
        "docs",
        "test",
        "build",
        "ci",
        "revert",
      ],
    ],
  },
};
