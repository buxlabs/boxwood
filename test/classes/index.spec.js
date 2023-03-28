const test = require("ava")
const { classes } = require("../..")

test("#classes is a function", (assert) => {
  assert.truthy(typeof classes === "function")
})

test("#classes concatenates classes", (assert) => {
  const className = classes("foo", "bar")
  assert.deepEqual(className, "foo bar")
})

test("#classes filters out non strings", (assert) => {
  const className = classes("foo", undefined, null, false, true)
  assert.deepEqual(className, "foo")
})

test("#classes works with objects", (assert) => {
  const className = classes({ foo: true, bar: false })
  assert.deepEqual(className, "foo")
})

test("#classes works with nested arrays", (assert) => {
  const className = classes("foo", ["bar", "baz"])
  assert.deepEqual(className, "foo bar baz")
})

test("#classes works with deeply nested arrays", (assert) => {
  const className = classes("foo", ["bar", ["baz", { qux: true, quux: false }]])
  assert.deepEqual(className, "foo bar baz qux")
})
