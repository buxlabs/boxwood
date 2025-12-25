const test = require("node:test")
const assert = require("node:assert")
const {
  normalizeBreakpoint,
  normalizeGap,
  normalizeSpacing,
  normalizeWidth,
  normalizeFlex
} = require("../../../ui/normalize")

test("normalizeBreakpoint: converts number to px string", () => {
  assert.strictEqual(normalizeBreakpoint(768), "768px")
})

test("normalizeBreakpoint: maps named breakpoints", () => {
  assert.strictEqual(normalizeBreakpoint("xs"), "575px")
  assert.strictEqual(normalizeBreakpoint("sm"), "767px")
  assert.strictEqual(normalizeBreakpoint("md"), "991px")
  assert.strictEqual(normalizeBreakpoint("lg"), "1199px")
  assert.strictEqual(normalizeBreakpoint("xl"), "1399px")
})

test("normalizeBreakpoint: returns other strings as-is", () => {
  assert.strictEqual(normalizeBreakpoint("500px"), "500px")
})

test("normalizeGap: converts number to px string", () => {
  assert.strictEqual(normalizeGap(16), "16px")
})

test("normalizeGap: maps named gaps", () => {
  assert.strictEqual(normalizeGap("xs"), "0.25rem")
  assert.strictEqual(normalizeGap("sm"), "0.5rem")
  assert.strictEqual(normalizeGap("md"), "1rem")
  assert.strictEqual(normalizeGap("lg"), "2rem")
  assert.strictEqual(normalizeGap("xl"), "4rem")
  assert.strictEqual(normalizeGap("none"), null)
})

test("normalizeGap: returns other strings as-is", () => {
  assert.strictEqual(normalizeGap("20px"), "20px")
})

test("normalizeWidth: converts number to px string", () => {
  assert.strictEqual(normalizeWidth(1200), "1200px")
})

test("normalizeWidth: returns strings as-is", () => {
  assert.strictEqual(normalizeWidth("100%"), "100%")
})

test("normalizeSpacing: converts number to px string", () => {
  assert.strictEqual(normalizeSpacing(32), "32px")
})

test("normalizeSpacing: maps named spacing", () => {
  assert.strictEqual(normalizeSpacing("xs"), "0.25rem")
  assert.strictEqual(normalizeSpacing("sm"), "0.5rem")
  assert.strictEqual(normalizeSpacing("md"), "1rem")
  assert.strictEqual(normalizeSpacing("lg"), "2rem")
  assert.strictEqual(normalizeSpacing("xl"), "4rem")
  assert.strictEqual(normalizeSpacing("none"), null)
})

test("normalizeSpacing: returns other strings as-is", () => {
  assert.strictEqual(normalizeSpacing("1.5rem"), "1.5rem")
})

test("normalizeFlex: maps start and end", () => {
  assert.strictEqual(normalizeFlex("start"), "flex-start")
  assert.strictEqual(normalizeFlex("end"), "flex-end")
})

test("normalizeFlex: returns other values as-is", () => {
  assert.strictEqual(normalizeFlex("center"), "center")
  assert.strictEqual(normalizeFlex(1), 1)
})
