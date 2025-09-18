const { createHash } = require("./hash")
const test = require("node:test")
const assert = require("node:assert")

test("createHash generates sequential hashes for new inputs", () => {
  const hash1 = createHash("unique-string-1")
  const hash2 = createHash("unique-string-2")
  const hash3 = createHash("unique-string-3")
  assert.strictEqual(hash1, "c1")
  assert.strictEqual(hash2, "c2")
  assert.strictEqual(hash3, "c3")
})

test("createHash handles empty string input", () => {
  const hash = createHash("")
  assert.strictEqual(hash, "c4") // Assuming this is the fourth unique input in the test sequence
})

test("createHash returns consistent hashes for the same input", () => {
  const hash1 = createHash("test-string")
  const hash2 = createHash("test-string")
  assert.strictEqual(hash1, hash2)
})

test("createHash returns different hashes for different inputs", () => {
  const hash1 = createHash("test-string-1")
  const hash2 = createHash("test-string-2")
  assert.notStrictEqual(hash1, hash2)
})

test("createHash handles special characters", () => {
  const hash1 = createHash("!@#$%^&*()")
  const hash2 = createHash("!@#$%^&*()")
  assert.strictEqual(hash1, hash2)
})

test("createHash handles long strings", () => {
  const longString = "a".repeat(1000)
  const hash1 = createHash(longString)
  const hash2 = createHash(longString)
  assert.strictEqual(hash1, hash2)
})
