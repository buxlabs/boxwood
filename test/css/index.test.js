const test = require("node:test")
const assert = require("node:assert")
const { css } = require("../..")

test("#css.create is a function", async () => {
  assert(typeof css.create === "function")
})

test("#css.create returns a string", async () => {
  const stylesheet = css.create({
    color: "red",
  })
  const actual = stylesheet.toString()
  const expected = "color:red"
  assert.strictEqual(actual, expected)
})

test("#css.create can add multiple styles", async () => {
  const stylesheet = css.create({
    color: "red",
    backgroundColor: "blue",
  })
  const actual = stylesheet.toString()
  const expected = "color:red;background-color:blue"
  assert.strictEqual(actual, expected)
})

test("#css.create returns a stylesheet that can add styles dynamically", async () => {
  const stylesheet = css.create({
    color: "red",
  })
  stylesheet.add({
    backgroundColor: "blue",
  })
  const actual = stylesheet.toString()
  const expected = "color:red;background-color:blue"
  assert.strictEqual(actual, expected)
})

test("#css.create returns a stylesheet that can set styles dynamically", async () => {
  const stylesheet = css.create({
    color: "red",
  })
  stylesheet.set("color", "blue")
  const actual = stylesheet.toString()
  const expected = "color:blue"
  assert.strictEqual(actual, expected)
})

test("#css.create returns a stylesheet that can set inline styles", async () => {
  const actual = css.inline({ color: "red" })
  const expected = "color:red"
  assert.strictEqual(actual, expected)
})
