const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("#css.load: throws when a broken css is loaded", () => {
  try {
    const { template } = compile(__dirname)
    template()
    assert.fail("Expected an error to be thrown")
  } catch (error) {
    assert.ok(error)
    assert.ok(error.message.includes("CSSError: invalid CSS for path"))
  }
})
