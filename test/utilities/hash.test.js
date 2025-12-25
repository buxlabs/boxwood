const test = require("node:test")
const assert = require("node:assert")
const { createHash } = require("../../utilities/hash")

test("#createHash returns a unique hash for a string", () => {
  const hash1 = createHash("test-string")
  assert.ok(hash1)
  assert.ok(hash1.startsWith("c"))
})

test("#createHash returns the same hash for the same string (cache hit)", () => {
  const string = "cached-test-string"
  const hash1 = createHash(string)
  const hash2 = createHash(string)
  assert.strictEqual(hash1, hash2)
})

test("#createHash returns different hashes for different strings", () => {
  const hash1 = createHash("string1")
  const hash2 = createHash("string2")
  assert.notStrictEqual(hash1, hash2)
})
