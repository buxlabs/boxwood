const test = require("node:test")
const assert = require("node:assert")
const { join } = require("path")
const { compile } = require("../..")

const count = (html, fragment) => html.split(fragment).length - 1

test("moves JSON-LD scripts to head", async () => {
  const { template } = await compile(join(__dirname, "./index.js"))
  const html = template()
  const headEnd = html.indexOf("</head>")
  const first = html.indexOf('type="application/ld+json"')
  const last = html.lastIndexOf('type="application/ld+json"')
  assert(first !== -1)
  assert(first < headEnd)
  assert(last < headEnd)
})

test("deduplicates identical JSON-LD scripts", async () => {
  const { template } = await compile(join(__dirname, "./index.js"))
  const html = template()
  // Widget is rendered twice as a component, but its JSON-LD appears once
  assert.strictEqual(count(html, '"@type":"Product","name":"Widget"'), 1)
})

test("keeps distinct JSON-LD scripts", async () => {
  const { template } = await compile(join(__dirname, "./index.js"))
  const html = template()
  assert.strictEqual(count(html, 'type="application/ld+json"'), 2)
  assert.strictEqual(count(html, '"@type":"Product","name":"Gadget"'), 1)
})

test("keeps JSON-LD content unescaped", async () => {
  const { template } = await compile(join(__dirname, "./index.js"))
  const html = template()
  assert(html.includes('{"@context":"https://schema.org","@type":"Product","name":"Widget"}'))
  assert(!html.includes("&quot;"))
})

test("fragment without head keeps JSON-LD in place, deduplicated", async () => {
  const { template } = await compile(join(__dirname, "./fragment.js"))
  const html = template()
  assert.strictEqual(count(html, 'type="application/ld+json"'), 1)
  assert(html.includes('<script type="application/ld+json">{"@type":"Article"}</script>'))
})
