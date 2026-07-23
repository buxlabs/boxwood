const test = require("node:test")
const assert = require("node:assert")
const { slugify } = require("./slugify")

test("slugify: converts text to lowercase dashed slug", () => {
  assert.strictEqual(slugify("Hello World"), "hello-world")
})

test("slugify: strips diacritics", () => {
  assert.strictEqual(slugify("Mój tytuł"), "moj-tytul")
  assert.strictEqual(slugify("Zażółć gęślą jaźń"), "zazolc-gesla-jazn")
  assert.strictEqual(slugify("café naïve"), "cafe-naive")
})

test("slugify: maps characters without NFD decomposition", () => {
  assert.strictEqual(slugify("Łódź"), "lodz")
  assert.strictEqual(slugify("Øre"), "ore")
  assert.strictEqual(slugify("straße"), "strasse")
})

test("slugify: collapses punctuation into single dashes", () => {
  assert.strictEqual(slugify("Hello, World! 123"), "hello-world-123")
  assert.strictEqual(slugify("a -- b"), "a-b")
})

test("slugify: trims leading and trailing dashes", () => {
  assert.strictEqual(slugify("...abc..."), "abc")
})

test("slugify: returns empty string for non-alphanumeric input", () => {
  assert.strictEqual(slugify("***"), "")
  assert.strictEqual(slugify(""), "")
  assert.strictEqual(slugify(null), "")
})
