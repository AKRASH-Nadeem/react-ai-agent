// commitlint.config.cjs
// @versions: husky@9.x | @commitlint/cli@19.x | @commitlint/config-conventional@19.x
// ⚠️ Husky v9: do NOT add the . "$(dirname "$0")/_/husky.sh" sourcing line in hook files — that is v8 syntax.
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Enforce all standard Conventional Commits types
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "chore",
        "docs",
        "style",
        "refactor",
        "test",
        "perf",
        "ci",
        "revert",
      ],
    ],
    // Summary line max length
    "header-max-length": [2, "always", 72],
    // Lowercase type
    "type-case": [2, "always", "lower-case"],
    // Lowercase scope
    "scope-case": [2, "always", "lower-case"],
    // Lowercase start of subject
    "subject-case": [2, "always", "lower-case"],
    // No period at end of subject
    "subject-full-stop": [2, "never", "."],
    // Subject cannot be empty
    "subject-empty": [2, "never"],
    // Type cannot be empty
    "type-empty": [2, "never"],
  },
};
