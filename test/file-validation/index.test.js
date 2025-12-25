const test = require("node:test")
const assert = require("node:assert")
const { raw } = require("../..")

test("raw.load: throws when file has no extension", () => {
  try {
    const { join } = require("path")
    raw.load(join(__dirname, "noextension"))
    assert.fail("Expected an error to be thrown")
  } catch (error) {
    assert.ok(error)
    assert.ok(error.message.includes("FileError"))
    assert.ok(error.message.includes("has no extension"))
  }
})

test("raw.load: throws when trying to load a directory", () => {
  try {
    raw.load(__dirname)
    assert.fail("Expected an error to be thrown")
  } catch (error) {
    assert.ok(error)
    assert.ok(error.message.includes("FileError"))
  }
})
