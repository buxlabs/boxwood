const test = require("node:test")
const assert = require("node:assert")
const { compile, ScriptError } = require("../../..")

test("invalid client side JavaScript fails at compile time", () => {
  assert.throws(
    () => compile(__dirname),
    (error) => {
      assert.ok(error instanceof ScriptError)
      // The message points at the file, not at the browser console
      assert.match(error.message, /broken\.js/)
      return true
    }
  )
})
