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
  const expected = "color:red;"
  assert.strictEqual(actual, expected)
})

test("#css.create can add multiple styles", async () => {
  const stylesheet = css.create({
    color: "red",
    backgroundColor: "blue",
  })
  const actual = stylesheet.toString()
  const expected = "color:red;background-color:blue;"
  assert.strictEqual(actual, expected)
})

test("#css.create can handle camelCase properties", async () => {
  const stylesheet = css.create({
    backgroundColor: "blue",
  })
  const actual = stylesheet.toString()
  const expected = "background-color:blue;"
  assert.strictEqual(actual, expected)
})

test("#css.create can handle kebab-case properties", async () => {
  const stylesheet = css.create({
    "background-color": "blue",
  })
  const actual = stylesheet.toString()
  const expected = "background-color:blue;"
  assert.strictEqual(actual, expected)
})

test("#css.create can handle selectors", async () => {
  const stylesheet = css.create({
    ".class": {
      color: "blue",
    },
  })
  const actual = stylesheet.toString()
  const expected = ".class{color:blue;}"
  assert.strictEqual(actual, expected)
})

test("#css.create can handle pseudoselectors", async () => {
  const stylesheet = css.create({
    ".class": {
      color: "blue",
    },
    ".class:hover": {
      color: "red",
    },
  })
  const actual = stylesheet.toString()
  const expected = ".class{color:blue;}.class:hover{color:red;}"
  assert.strictEqual(actual, expected)
})

test("#css.create can handle media queries", async () => {
  const stylesheet = css.create({
    "@media (max-width: 600px)": {
      ".class": {
        color: "blue",
      },
    },
  })
  const actual = stylesheet.toString()
  const expected = "@media (max-width: 600px){.class{color:blue;}}"
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
  const expected = "color:red;background-color:blue;"
  assert.strictEqual(actual, expected)
})

test("#css.create returns a stylesheet that can set styles dynamically", async () => {
  const stylesheet = css.create({
    color: "red",
  })
  stylesheet.set("color", "blue")
  const actual = stylesheet.toString()
  const expected = "color:blue;"
  assert.strictEqual(actual, expected)
})

test("#css.create returns a stylesheet that can set inline styles", async () => {
  const actual = css.inline({ color: "red" })
  const expected = "color:red;"
  assert.strictEqual(actual, expected)
})
