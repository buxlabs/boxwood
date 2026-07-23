const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../../..")

const count = (html, fragment) => html.split(fragment).length - 1

test("renders Gallery with full images array", async () => {
  const { template } = await compile(__dirname)
  const html = template({ images: ["/a.jpg", "/b.jpg", "/c.jpg"] })
  assert(html.includes('src="/a.jpg"'))
  assert(html.includes('src="/b.jpg"'))
  assert(html.includes('src="/c.jpg"'))
})

test("renders Gallery with a slice of the images array", async () => {
  const { template } = await compile(__dirname)
  const html = template({ images: ["/a.jpg", "/b.jpg", "/c.jpg"] })
  // First gallery renders all three images, second renders the first two,
  // third renders the last one, fourth renders the first and the last one,
  // fifth renders all three via a multi-line array literal,
  // sixth renders the first and the last one via spread elements
  assert.strictEqual(count(html, 'src="/a.jpg"'), 5)
  assert.strictEqual(count(html, 'src="/b.jpg"'), 3)
  assert.strictEqual(count(html, 'src="/c.jpg"'), 5)
  assert.strictEqual(count(html, "<img"), 13)
  assert(!html.includes("{images.slice"))
})

test("renders Gallery with an array literal of images", async () => {
  const { template } = await compile(__dirname)
  const html = template({ images: ["/a.jpg", "/b.jpg", "/c.jpg"] })
  assert(!html.includes("{[images"))
  assert(html.includes('src="/a.jpg"'))
  assert(html.includes('src="/c.jpg"'))
})

test("renders Gallery with a multi-line array literal of images", async () => {
  const { template } = await compile(__dirname)
  const html = template({ images: ["/a.jpg", "/b.jpg", "/c.jpg"] })
  // No leftovers of the multi-line tag rendered as text
  assert(!html.includes("{["))
  assert(!html.includes("]}"))
  assert(!html.includes("images[0]"))
})

test("renders Gallery with spread elements in an array literal", async () => {
  const { template } = await compile(__dirname)
  const html = template({ images: ["/a.jpg", "/b.jpg", "/c.jpg"] })
  assert(!html.includes("..."))
  assert(!html.includes("images.slice"))
})
