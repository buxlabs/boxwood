const test = require("node:test")
const assert = require("node:assert")
const { compile, FileError } = require("../../..")

test("#img.load: throws when an image is not found", () => {
  try {
    const { template } = compile(__dirname)
    template()
    assert.fail("Expected an error to be thrown")
  } catch (error) {
    assert.ok(error)
    assert.ok(error instanceof FileError)
    assert.ok(error.message.includes("cannot read file"))
  }
})
