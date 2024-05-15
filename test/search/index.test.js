const test = require("node:test")
const assert = require("node:assert")

const { compile } = require("../..")

test("does not render undefined nodes", async () => {
  const { template } = await compile(__dirname)
  const html = template({
    count: 5,
    results: [
      {
        title: "foo",
        description: "foo",
        featured: true,
        sizes: [5, 10, 15],
      },
      {
        title: "bar",
        description: "bar",
        featured: false,
        sizes: [5, 10, 15, 20],
      },
      {
        title: "baz",
        description: "baz",
        featured: true,
        sizes: [5, 10, 15, 20, 25],
      },
      {
        title: "qux",
        description: "qux",
        featured: false,
        sizes: [5, 10, 15, 20, 25, 30],
      },
      {
        title: "quux",
        description: "quux",
        featured: true,
        sizes: [5, 10, 15, 20, 25, 30, 35],
      },
    ],
  })
  assert(!html.includes("<undefined></undefined>"))
  assert(!html.includes("undefined"))
})
