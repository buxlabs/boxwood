const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("#json.load: throws when a broken json is loaded", () => {
  try {
    const { template } = compile(__dirname)
    template()
    assert.fail("Expected an error to be thrown")
  } catch (error) {
    assert.ok(error)
    assert.ok(error.message.includes("JSONError: cannot parse file"))
  }
})
