const test = require("node:test")
const assert = require("node:assert")
const { compile, ScriptError } = require("../../..")

test("import and export are rejected in an inline script", () => {
  assert.throws(
    () => compile(__dirname),
    (error) => {
      assert.ok(error instanceof ScriptError)
      assert.match(error.message, /import and export are not supported/)
      return true
    }
  )
})
