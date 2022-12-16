/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ["js", "ts"],
  transform: {
    "^.+\\.ts$": ["ts-jest"]
  },
  testMatch: ["**/tests/**/*.test.ts"]
}
