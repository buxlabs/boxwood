const test = require("node:test")
const assert = require("node:assert")
const { join } = require("path")
const { compile } = require("../..")

const todos = [
  { description: "</script><img src=x onerror=alert(1)>" },
  { description: "a < b && c > d" },
]

const render = async () => {
  const { template } = await compile(join(__dirname, "fixtures/payload.js"))
  return template()
}

const contents = (html) =>
  html.match(/<script type="application\/json"[^>]*>([\s\S]*?)<\/script>/)[1]

/*
 * A JSON script is how server data reaches a client script without going
 * through js``, where an interpolated value is code rather than data. The
 * contents are never executed - but they still sit inside a <script> element,
 * and a "<" in the data used to close it early and turn the rest into markup.
 */

test("#data-script: data cannot close its own script tag", async () => {
  const html = await render()

  // The payload carries the closing sequence, so the page would otherwise
  // hold two of them and the browser would parse the rest as markup. The
  // text after it stays in the document - inert, because it is still data.
  assert.strictEqual(html.match(/<\/script>/g).length, 1)
  assert(!/<\/script>\s*<img/.test(html))
})

test("#data-script: every < is escaped", async () => {
  const html = await render()

  assert(!contents(html).includes("<"))
  assert(contents(html).includes("\\u003c"))
})

test("#data-script: JSON.parse gives the original value back", async () => {
  const html = await render()

  // The whole point: escaped on the way out, identical on the way in.
  assert.deepStrictEqual(JSON.parse(contents(html)), todos)
})

test("#data-script: a payload with no angle brackets is untouched", async () => {
  const { template } = await compile(join(__dirname, "fixtures/plain.js"))
  const html = template()

  assert(
    html.includes(
      '<script type="application/json" id="plain">{"a":1}</script>',
    ),
  )
})
