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
  assert(html.includes("That") && html.includes("s all!"))
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
– En dash
• Bullet
- Regular again
  `
  const html = template(markdown)
  assert(html.includes("<ul>"))
  assert(html.includes("<li>Regular dash</li>"))
  assert(html.includes("<li>Em dash</li>"))
  assert(html.includes("<li>En dash</li>"))
  assert(html.includes("<li>Bullet</li>"))
  assert(html.includes("<li>Regular again</li>"))
  assert(html.includes("</ul>"))
})

test("renders ordered list", async () => {
  const { template } = await compile(__dirname)
  const markdown = `
1. First item
2. Second item
3. Third item
  `
  const html = template(markdown)
  assert(html.includes("<ol>"))
  assert(html.includes("<li>First item</li>"))
  assert(html.includes("<li>Second item</li>"))
  assert(html.includes("<li>Third item</li>"))
  assert(html.includes("</ol>"))
})

test("renders mixed unordered and ordered lists", async () => {
  const { template } = await compile(__dirname)
  const markdown = `
# Shopping List

Buy these items:

- Apples
- Bananas
- Oranges

Follow these steps:

1. Go to store
2. Buy items
3. Return home
  `
  const html = template(markdown)
  assert(html.includes("<h1>Shopping List</h1>"))
  assert(html.includes("<p>Buy these items:</p>"))
  assert(html.includes("<ul>"))
  assert(html.includes("<li>Apples</li>"))
  assert(html.includes("</ul>"))
  assert(html.includes("<p>Follow these steps:</p>"))
  assert(html.includes("<ol>"))
  assert(html.includes("<li>Go to store</li>"))
  assert(html.includes("</ol>"))
})

test("handles transition from ordered to unordered list", async () => {
  const { template } = await compile(__dirname)
  const markdown = `
1. First ordered
2. Second ordered
- First unordered
- Second unordered
  `
  const html = template(markdown)
  assert(html.includes("<ol>"))
  assert(html.includes("<li>First ordered</li>"))
  assert(html.includes("<li>Second ordered</li>"))
  assert(html.includes("</ol>"))
  assert(html.includes("<ul>"))
  assert(html.includes("<li>First unordered</li>"))
  assert(html.includes("<li>Second unordered</li>"))
  assert(html.includes("</ul>"))
})

test("filters out empty list items", async () => {
  const { template } = await compile(__dirname)
  const markdown = `
- Item with content
- 
• 
- Another item
  `
  const html = template(markdown)
  assert(html.includes("<ul>"))
  assert(html.includes("<li>Item with content</li>"))
  assert(html.includes("<li>Another item</li>"))
  assert(!html.includes("<li></li>"))
})

test("handles array of markdown strings", async () => {
  const { template } = await compile(__dirname)
  const markdown = ["# First", "# Second"]
  const html = template(markdown)
  assert(html.includes("<h1>First</h1>"))
  assert(html.includes("<h1>Second</h1>"))
})

test("groups consecutive blockquotes", async () => {
  const { template } = await compile(__dirname)
  const markdown = `
> First line
> Second line
> Third line

Regular paragraph
  `
  const html = template(markdown)
  assert(html.includes("<blockquote>"))
  assert(html.includes("<p>First line\nSecond line\nThird line</p>"))
  assert(html.includes("</blockquote>"))
  assert(html.includes("Regular paragraph"))
  const blockquoteCount = (html.match(/<blockquote>/g) || []).length
  assert.strictEqual(blockquoteCount, 1)
})

test("renders bold text", async () => {
  const { template } = await compile(__dirname)
  const markdown = "This is **bold** text"
  const html = template(markdown)
  assert(html.includes("<p>This is <strong>bold</strong> text</p>"))
})

test("renders italic text", async () => {
  const { template } = await compile(__dirname)
  const markdown = "This is *italic* text"
  const html = template(markdown)
  assert(html.includes("<p>This is <em>italic</em> text</p>"))
})

test("renders bold and italic together", async () => {
  const { template } = await compile(__dirname)
  const markdown = "**bold** and *italic* text"
  const html = template(markdown)
  assert(html.includes("<strong>bold</strong>"))
  assert(html.includes("<em>italic</em>"))
})

test("renders inline markdown in headings", async () => {
  const { template } = await compile(__dirname)
  const markdown = "# Heading with **bold**"
  const html = template(markdown)
  assert(html.includes("<h1>Heading with <strong>bold</strong></h1>"))
})

test("renders inline markdown in lists", async () => {
  const { template } = await compile(__dirname)
  const markdown = `
- Item with **bold**
- Item with *italic*
  `
  const html = template(markdown)
  assert(html.includes("<li>Item with <strong>bold</strong></li>"))
  assert(html.includes("<li>Item with <em>italic</em></li>"))
})

test("renders inline code with backticks", async () => {
  const { template } = await compile(__dirname)
  const markdown = "This is `inline code` in a sentence."
  const html = template(markdown)
  assert(html.includes("<code>inline code</code>"))
  assert(html.includes("This is "))
  assert(html.includes(" in a sentence."))
})

test("renders inline code mixed with bold and italic", async () => {
  const { template } = await compile(__dirname)
  const markdown = "Mix `code` and **bold** and *italic* together."
  const html = template(markdown)
  assert(html.includes("<code>code</code>"))
  assert(html.includes("<strong>bold</strong>"))
  assert(html.includes("<em>italic</em>"))
})
