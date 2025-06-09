const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("#img.load: throws when a non image file is loaded", () => {
  try {
    const { template } = compile(__dirname)
    template()
    assert.fail("Expected an error to be thrown")
  } catch (error) {
    assert.ok(error)
  }
})
