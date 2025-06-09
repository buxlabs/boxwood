const test = require("node:test")
const assert = require("node:assert")
const { classes } = require("../..")

test("#classes is a function", () => {
  assert(typeof classes === "function")
})

test("#classes concatenates classes", () => {
  const className = classes("foo", "bar")
  assert.deepEqual(className, "foo bar")
})

test("#classes filters out non strings", () => {
  const className = classes("foo", undefined, null, false, true)
  assert.deepEqual(className, "foo")
})

test("#classes works with objects", () => {
  const className = classes({ foo: true, bar: false })
  assert.deepEqual(className, "foo")
})

test("#classes works with nested arrays", () => {
  const className = classes("foo", ["bar", "baz"])
  assert.deepEqual(className, "foo bar baz")
})

test("#classes works with deeply nested arrays", () => {
  const className = classes("foo", ["bar", ["baz", { qux: true, quux: false }]])
  assert.deepEqual(className, "foo bar baz qux")
})
