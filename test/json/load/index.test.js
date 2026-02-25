const test = require("node:test")
const assert = require("node:assert")
const { compile, JSONError } = require("../../..")

test("#json.load: throws when a broken json is loaded", () => {
  try {
    const { template } = compile(__dirname)
    template()
    assert.fail("Expected an error to be thrown")
  } catch (error) {
    assert.ok(error)
    assert.ok(error instanceof JSONError)
    assert.ok(error.message.includes("cannot parse file"))
  }
})
