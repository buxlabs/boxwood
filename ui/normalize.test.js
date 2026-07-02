const { test } = require("node:test")
const assert = require("node:assert")
const { toNumber, toPixels } = require("./normalize")

test("toNumber: converts string number to integer", () => {
  assert.strictEqual(toNumber("42"), 42)
  assert.strictEqual(toNumber("0"), 0)
  assert.strictEqual(toNumber("999"), 999)
})

test("toNumber: preserves actual numbers", () => {
  assert.strictEqual(toNumber(42), 42)
  assert.strictEqual(toNumber(0), 0)
  assert.strictEqual(toNumber(999), 999)
})

test("toNumber: preserves non-numeric strings", () => {
  assert.strictEqual(toNumber("100px"), "100px")
  assert.strictEqual(toNumber("1rem"), "1rem")
  assert.strictEqual(toNumber("auto"), "auto")
  assert.strictEqual(toNumber("100%"), "100%")
  assert.strictEqual(toNumber("1fr 2fr"), "1fr 2fr")
})

test("toNumber: handles edge cases", () => {
  assert.strictEqual(toNumber(""), "")
  assert.strictEqual(toNumber(null), null)
  assert.strictEqual(toNumber(undefined), undefined)
})

test("toPixels: converts number to pixel string", () => {
  assert.strictEqual(toPixels(42), "42px")
  assert.strictEqual(toPixels(0), "0px")
  assert.strictEqual(toPixels(999), "999px")
})

test("toPixels: converts string number to pixel string", () => {
  assert.strictEqual(toPixels("42"), "42px")
  assert.strictEqual(toPixels("0"), "0px")
  assert.strictEqual(toPixels("999"), "999px")
})

test("toPixels: preserves non-numeric strings", () => {
  assert.strictEqual(toPixels("100px"), "100px")
  assert.strictEqual(toPixels("1rem"), "1rem")
  assert.strictEqual(toPixels("auto"), "auto")
  assert.strictEqual(toPixels("100%"), "100%")
  assert.strictEqual(toPixels("1fr 2fr"), "1fr 2fr")
  assert.strictEqual(toPixels("repeat(3, 1fr)"), "repeat(3, 1fr)")
})

test("toPixels: handles edge cases", () => {
  assert.strictEqual(toPixels(""), "")
  assert.strictEqual(toPixels(null), null)
  assert.strictEqual(toPixels(undefined), undefined)
})
