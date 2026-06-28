const test = require("node:test")
const assert = require("node:assert")
const { findMatchingBracket } = require("./brackets")

test("finds matching bracket for simple case", () => {
  const text = "[hello]"
  const result = findMatchingBracket(text, 0)
  assert.strictEqual(result, 6)
})

test("finds matching bracket with nested brackets", () => {
  const text = "[hello [world]]"
  const result = findMatchingBracket(text, 0)
  assert.strictEqual(result, 14)
})

test("finds matching bracket for inner bracket", () => {
  const text = "[hello [world]]"
  const result = findMatchingBracket(text, 7)
  assert.strictEqual(result, 13)
})

test("returns -1 when no matching bracket found", () => {
  const text = "[hello"
  const result = findMatchingBracket(text, 0)
  assert.strictEqual(result, -1)
})

test("returns -1 when brackets are unbalanced", () => {
  const text = "[hello [world]"
  const result = findMatchingBracket(text, 0)
  assert.strictEqual(result, -1)
})

test("handles multiple levels of nesting", () => {
  const text = "[a [b [c] d] e]"
  const result = findMatchingBracket(text, 0)
  assert.strictEqual(result, 14)
})

test("handles escaped opening bracket", () => {
  const text = "[hello \\[world]"
  const result = findMatchingBracket(text, 0)
  assert.strictEqual(result, 14)
})

test("handles escaped closing bracket", () => {
  const text = "[hello \\] world]"
  const result = findMatchingBracket(text, 0)
  assert.strictEqual(result, 15)
})

test("handles empty brackets", () => {
  const text = "[]"
  const result = findMatchingBracket(text, 0)
  assert.strictEqual(result, 1)
})

test("handles bracket at end of string", () => {
  const text = "[hello world]"
  const result = findMatchingBracket(text, 0)
  assert.strictEqual(result, 12)
})

test("handles image inside link pattern", () => {
  const text = "[![alt text](/image.png)](/link)"
  const result = findMatchingBracket(text, 0)
  assert.strictEqual(result, 24)
})

test("handles complex nested pattern", () => {
  const text = "[Click ![icon](/icon.png) here](/url)"
  const result = findMatchingBracket(text, 0)
  assert.strictEqual(result, 30)
})

test("finds inner image bracket in link", () => {
  const text = "[![alt text](/image.png)](/link)"
  // Position 2 is the '[' in '![', and it should match ']' at position 11
  const result = findMatchingBracket(text, 2)
  assert.strictEqual(result, 11)
})

test("handles multiple escaped brackets", () => {
  const text = "[hello \\[world\\] test]"
  const result = findMatchingBracket(text, 0)
  assert.strictEqual(result, 21)
})

test("handles bracket not at start of string", () => {
  const text = "some text [hello] more text"
  const result = findMatchingBracket(text, 10)
  assert.strictEqual(result, 16)
})

test("handles deeply nested brackets", () => {
  const text = "[a [b [c [d [e]]]]]"
  const result = findMatchingBracket(text, 0)
  assert.strictEqual(result, 18)
})

test("handles adjacent brackets", () => {
  const text = "[[hello]]"
  const outer = findMatchingBracket(text, 0)
  const inner = findMatchingBracket(text, 1)
  assert.strictEqual(outer, 8)
  assert.strictEqual(inner, 7)
})

test("returns -1 for startPos at end of string", () => {
  const text = "[hello]"
  const result = findMatchingBracket(text, 6)
  assert.strictEqual(result, -1)
})

test("handles real markdown link pattern", () => {
  const text = "[text](url)"
  const result = findMatchingBracket(text, 0)
  assert.strictEqual(result, 5)
})

test("handles real markdown image pattern", () => {
  const text = "![alt](url)"
  const result = findMatchingBracket(text, 1)
  assert.strictEqual(result, 5)
})
