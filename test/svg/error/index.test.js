const test = require("node:test")
const assert = require("node:assert")
const { compile, SVGError } = require("../../..")

test("#svg.load: throws when an unsupported SVG type is loaded", () => {
  try {
    const { template } = compile(__dirname)
    template()
    assert.fail("Expected an error to be thrown")
  } catch (error) {
    assert.ok(error)
    assert.ok(error instanceof SVGError)
    assert.ok(error.message.includes("unsupported SVG type"))
  }
})
