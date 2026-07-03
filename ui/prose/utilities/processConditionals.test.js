const test = require("node:test")
const assert = require("node:assert")
const { processConditionals, isTruthy } = require("./processConditionals")

// isTruthy tests
test("isTruthy: returns false for null", () => {
  assert.strictEqual(isTruthy(null), false)
})

test("isTruthy: returns false for undefined", () => {
  assert.strictEqual(isTruthy(undefined), false)
})

test("isTruthy: returns false for empty string", () => {
  assert.strictEqual(isTruthy(""), false)
})

test("isTruthy: returns false for zero", () => {
  assert.strictEqual(isTruthy(0), false)
})

test("isTruthy: returns false for false", () => {
  assert.strictEqual(isTruthy(false), false)
})

test("isTruthy: returns false for empty array", () => {
  assert.strictEqual(isTruthy([]), false)
})

test("isTruthy: returns true for non-empty string", () => {
  assert.strictEqual(isTruthy("hello"), true)
})

test("isTruthy: returns true for non-zero number", () => {
  assert.strictEqual(isTruthy(1), true)
  assert.strictEqual(isTruthy(-1), true)
})

test("isTruthy: returns true for true", () => {
  assert.strictEqual(isTruthy(true), true)
})

test("isTruthy: returns true for non-empty array", () => {
  assert.strictEqual(isTruthy([1, 2, 3]), true)
})

test("isTruthy: returns true for objects", () => {
  assert.strictEqual(isTruthy({}), true)
  assert.strictEqual(isTruthy({ key: "value" }), true)
})

// processConditionals tests
test("processConditionals: keeps content when condition is true", () => {
  const text = "{#if show}Content{/if}"
  const result = processConditionals(text, { show: true })
  assert.strictEqual(result, "Content")
})

test("processConditionals: removes content when condition is false", () => {
  const text = "{#if show}Content{/if}"
  const result = processConditionals(text, { show: false })
  assert.strictEqual(result, "")
})

test("processConditionals: handles multiple blocks", () => {
  const text = "{#if a}First{/if} {#if b}Second{/if}"
  const result = processConditionals(text, { a: true, b: false })
  assert.strictEqual(result, "First ")
})

test("processConditionals: handles nested properties", () => {
  const text = "{#if user.active}Active{/if}"
  const result = processConditionals(text, { user: { active: true } })
  assert.strictEqual(result, "Active")
})

test("processConditionals: handles array indexing", () => {
  const text = "{#if items[0]}First item exists{/if}"
  const result = processConditionals(text, { items: ["first", "second"] })
  assert.strictEqual(result, "First item exists")
})

test("processConditionals: handles nested if blocks", () => {
  const text = "{#if outer}Outer {#if inner}Inner{/if} Content{/if}"
  const result = processConditionals(text, { outer: true, inner: true })
  assert.strictEqual(result, "Outer Inner Content")
})

test("processConditionals: handles nested if with outer false", () => {
  const text = "{#if outer}Outer {#if inner}Inner{/if} Content{/if}"
  const result = processConditionals(text, { outer: false, inner: true })
  assert.strictEqual(result, "")
})

test("processConditionals: handles nested if with inner false", () => {
  const text = "{#if outer}Outer {#if inner}Inner{/if} Content{/if}"
  const result = processConditionals(text, { outer: true, inner: false })
  assert.strictEqual(result, "Outer  Content")
})

test("processConditionals: removes all blocks when no data", () => {
  const text = "{#if show}Content{/if}"
  const result = processConditionals(text, null)
  assert.strictEqual(result, "")
})

test("processConditionals: handles unclosed if block", () => {
  const text = "{#if show}Content without closing"
  const result = processConditionals(text, { show: true })
  // Should return as-is when not properly closed
  assert.strictEqual(result, "{#if show}Content without closing")
})

test("processConditionals: preserves whitespace and newlines", () => {
  const text = `{#if show}
Line 1
Line 2
{/if}`
  const result = processConditionals(text, { show: true })
  assert.strictEqual(
    result,
    `
Line 1
Line 2
`,
  )
})

test("processConditionals: handles content before and after", () => {
  const text = "Before {#if show}Middle{/if} After"
  const result = processConditionals(text, { show: true })
  assert.strictEqual(result, "Before Middle After")
})

test("processConditionals: handles multiple nested levels", () => {
  const text = "{#if a}{#if b}{#if c}Deep{/if}{/if}{/if}"
  const result = processConditionals(text, { a: true, b: true, c: true })
  assert.strictEqual(result, "Deep")
})

test("processConditionals: returns original text when no if blocks", () => {
  const text = "No conditionals here"
  const result = processConditionals(text, { show: true })
  assert.strictEqual(result, "No conditionals here")
})

test("processConditionals: handles null text", () => {
  const result = processConditionals(null, { show: true })
  assert.strictEqual(result, null)
})

test("processConditionals: handles undefined text", () => {
  const result = processConditionals(undefined, { show: true })
  assert.strictEqual(result, undefined)
})

// Comparison operator tests
test("processConditionals: handles greater than operator", () => {
  const text = "{#if count > 5}Many items{/if}"
  const result = processConditionals(text, { count: 10 })
  assert.strictEqual(result, "Many items")
})

test("processConditionals: handles greater than operator (false)", () => {
  const text = "{#if count > 5}Many items{/if}"
  const result = processConditionals(text, { count: 3 })
  assert.strictEqual(result, "")
})

test("processConditionals: handles less than operator", () => {
  const text = "{#if count < 5}Few items{/if}"
  const result = processConditionals(text, { count: 3 })
  assert.strictEqual(result, "Few items")
})

test("processConditionals: handles greater than or equal operator", () => {
  const text = "{#if count >= 5}Five or more{/if}"
  const result = processConditionals(text, { count: 5 })
  assert.strictEqual(result, "Five or more")
})

test("processConditionals: handles less than or equal operator", () => {
  const text = "{#if count <= 5}Five or less{/if}"
  const result = processConditionals(text, { count: 5 })
  assert.strictEqual(result, "Five or less")
})

test("processConditionals: handles equals operator", () => {
  const text = "{#if status == 'active'}Active user{/if}"
  const result = processConditionals(text, { status: "active" })
  assert.strictEqual(result, "Active user")
})

test("processConditionals: handles not equals operator", () => {
  const text = "{#if status != 'inactive'}User is active{/if}"
  const result = processConditionals(text, { status: "active" })
  assert.strictEqual(result, "User is active")
})

test("processConditionals: handles array length comparison", () => {
  const text = "{#if tags.length > 0}Has tags{/if}"
  const result = processConditionals(text, { tags: ["a", "b", "c"] })
  assert.strictEqual(result, "Has tags")
})

test("processConditionals: handles array length comparison (false)", () => {
  const text = "{#if tags.length > 0}Has tags{/if}"
  const result = processConditionals(text, { tags: [] })
  assert.strictEqual(result, "")
})

test("processConditionals: compares with number literal", () => {
  const text = "{#if age >= 18}Adult{/if}"
  const result = processConditionals(text, { age: 25 })
  assert.strictEqual(result, "Adult")
})

test("processConditionals: compares with boolean literal", () => {
  const text = "{#if verified == true}Verified{/if}"
  const result = processConditionals(text, { verified: true })
  assert.strictEqual(result, "Verified")
})

test("processConditionals: compares two variables", () => {
  const text = "{#if current > previous}Increased{/if}"
  const result = processConditionals(text, { current: 10, previous: 5 })
  assert.strictEqual(result, "Increased")
})

test("processConditionals: handles nested property comparison", () => {
  const text = "{#if user.age >= 18}Adult user{/if}"
  const result = processConditionals(text, { user: { age: 21 } })
  assert.strictEqual(result, "Adult user")
})

test("processConditionals: handles string comparison with quotes", () => {
  const text = '{#if name == "John"}Hello John{/if}'
  const result = processConditionals(text, { name: "John" })
  assert.strictEqual(result, "Hello John")
})

test("processConditionals: handles negative numbers", () => {
  const text = "{#if temperature < 0}Below freezing{/if}"
  const result = processConditionals(text, { temperature: -5 })
  assert.strictEqual(result, "Below freezing")
})

test("processConditionals: handles decimal numbers", () => {
  const text = "{#if price > 9.99}Expensive{/if}"
  const result = processConditionals(text, { price: 19.99 })
  assert.strictEqual(result, "Expensive")
})
