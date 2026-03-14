const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("boxwood")

test("renders with default props", async () => {
  const { template } = await compile(__dirname)
  const html = template("foo")
  assert(html.includes("foo"))
})

test("supports id", async () => {
  const { template } = await compile(__dirname)
  const html = template({ id: "hello" }, "bar")
  assert(html.includes("hello"))
  assert(html.includes("bar"))
})

test("renders unordered list with dash", async () => {
  const { template } = await compile(__dirname)
  const markdown = `
- First item
- Second item
- Third item
  `
  const html = template(markdown)
  assert(html.includes("<ul>"))
  assert(html.includes("<li>First item</li>"))
  assert(html.includes("<li>Second item</li>"))
  assert(html.includes("<li>Third item</li>"))
  assert(html.includes("</ul>"))
})

test("renders unordered list with em dash", async () => {
  const { template } = await compile(__dirname)
  const markdown = `
— First item
— Second item
— Third item
  `
  const html = template(markdown)
  assert(html.includes("<ul>"))
  assert(html.includes("<li>First item</li>"))
  assert(html.includes("<li>Second item</li>"))
  assert(html.includes("<li>Third item</li>"))
  assert(html.includes("</ul>"))
})

test("renders mixed content with lists", async () => {
  const { template } = await compile(__dirname)
  const markdown = `
# Shopping List

Here are the items:

- Apples
- Bananas
- Oranges

That's all!
  `
  const html = template(markdown)
  assert(html.includes("<h1>Shopping List</h1>"))
  assert(html.includes("<p>Here are the items:</p>"))
  assert(html.includes("<ul>"))
  assert(html.includes("<li>Apples</li>"))
  assert(html.includes("<li>Bananas</li>"))
  assert(html.includes("<li>Oranges</li>"))
  assert(html.includes("</ul>"))
  assert(html.includes("<p>That&#39;s all!</p>"))
})

test("handles list followed by heading", async () => {
  const { template } = await compile(__dirname)
  const markdown = `
- Item one
- Item two

## Next Section
  `
  const html = template(markdown)
  assert(html.includes("<ul>"))
  assert(html.includes("<li>Item one</li>"))
  assert(html.includes("</ul>"))
  assert(html.includes("<h2>Next Section</h2>"))
})

test("handles both dash types in same list", async () => {
  const { template } = await compile(__dirname)
  const markdown = `
- Regular dash
— Em dash
- Regular again
  `
  const html = template(markdown)
  assert(html.includes("<ul>"))
  assert(html.includes("<li>Regular dash</li>"))
  assert(html.includes("<li>Em dash</li>"))
  assert(html.includes("<li>Regular again</li>"))
  assert(html.includes("</ul>"))
})
