const test = require("node:test")
const assert = require("node:assert")
const { stripComments } = require("./stripComments")

test("stripComments: removes a single-line comment", () => {
  const result = stripComments("before {!-- note --} after")
  assert.strictEqual(result, "before  after")
})

test("stripComments: removes a multi-line comment", () => {
  const result = stripComments("before\n{!--\nline1\nline2\n--}\nafter")
  assert.strictEqual(result, "before\n\nafter")
})

test("stripComments: removes multiple comments", () => {
  const result = stripComments("{!-- a --}x{!-- b --}y")
  assert.strictEqual(result, "xy")
})

test("stripComments: keeps unclosed comment as-is", () => {
  const result = stripComments("before {!-- unclosed")
  assert.strictEqual(result, "before {!-- unclosed")
})

test("stripComments: does not execute templating inside comments", () => {
  const result = stripComments("{!-- {#each items}{item}{/each} --}rest")
  assert.strictEqual(result, "rest")
})

test("stripComments: handles non-string input", () => {
  assert.strictEqual(stripComments(null), null)
  assert.strictEqual(stripComments(""), "")
})
