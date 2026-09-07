const test = require("node:test")
const assert = require("node:assert")
const { JSDOM } = require("jsdom")
const { compile } = require("../../..")
const { runBundleAgain } = require("../helpers")
const { inlineScripts, parseInlineScript } = require("../../scripts/helpers")

const STARTS = [0, 5, 10]

async function render(props = { starts: STARTS }) {
  const { template } = await compile(__dirname)
  // runScripts: "dangerously" executes the embedded <script> as the doc parses.
  const dom = new JSDOM(template(props), { runScripts: "dangerously" })
  const { document } = dom.window

  const counters = [...document.querySelectorAll("div")]
  const values = () =>
    [...document.querySelectorAll("span")].map((span) => span.textContent)

  function click(index) {
    counters[index]
      .querySelector("button")
      .dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }))
  }

  return { dom, document, counters, values, click }
}

test("#reactivity/counters: it renders one instance per start value", async () => {
  const { template } = await compile(__dirname)
  const html = template({ starts: STARTS })

  assert(html.includes('<span class="c2" data-value="">0</span>'))
  assert(html.includes('<span class="c2" data-value="">5</span>'))
  assert(html.includes('<span class="c2" data-value="">10</span>'))
  assert.strictEqual(html.match(/data-counter=""/g).length, 3)
})

test("#reactivity/counters: three instances share one script and one style", async () => {
  const { template } = await compile(__dirname)
  const html = template({ starts: STARTS })

  assert.strictEqual(inlineScripts(html).length, 1)
  assert.strictEqual(html.match(/<style>/g).length, 1)

  // Throws when the emitted bundle is not valid JavaScript.
  const tree = parseInlineScript(html)
  assert(tree.body.length > 0)
})

test("#reactivity/counters: each instance starts from its own server rendered value", async () => {
  const { values } = await render()

  assert.deepStrictEqual(values(), ["0", "5", "10"])
})

test("#reactivity/counters: clicking one instance leaves the others alone", async () => {
  const { values, click } = await render()

  click(1)
  assert.deepStrictEqual(values(), ["0", "6", "10"])

  click(1)
  click(1)
  assert.deepStrictEqual(values(), ["0", "8", "10"])

  click(0)
  assert.deepStrictEqual(values(), ["1", "8", "10"])

  click(2)
  assert.deepStrictEqual(values(), ["1", "8", "11"])
})

test("#reactivity/counters: a single instance still works", async () => {
  const { values, click } = await render({ starts: [3] })

  assert.deepStrictEqual(values(), ["3"])
  click(0)
  assert.deepStrictEqual(values(), ["4"])
})

test("#reactivity/counters: running the bundle twice does not stack listeners", async () => {
  const { dom, values, click } = await render()

  // A second run must not register a single new listener.
  assert.strictEqual(runBundleAgain(dom), 0)

  click(1)
  assert.deepStrictEqual(values(), ["0", "6", "10"])
})
