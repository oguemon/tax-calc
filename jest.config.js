/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ["js", "ts"],
  transform: {
    "^.+\\.ts$": ["@swc/jest"]
  },
  testMatch: ["**/tests/**/*.test.ts"]
}
