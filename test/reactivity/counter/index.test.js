const test = require("node:test")
const assert = require("node:assert")
const { JSDOM } = require("jsdom")
const { compile } = require("../../..")
const { runBundleAgain } = require("../helpers")
const { parseInlineScript } = require("../../scripts/helpers")

async function render(props = {}) {
  const { template } = await compile(__dirname)
  // runScripts: "dangerously" executes the embedded <script> as the doc parses.
  const dom = new JSDOM(template(props), { runScripts: "dangerously" })
  const { document } = dom.window

  const value = document.querySelector("span")
  const button = document.querySelector("button")

  function click() {
    button.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }))
  }

  return { dom, document, value, button, click }
}

test("#reactivity/counter: it renders the initial value with scoped styles", async () => {
  const { template } = await compile(__dirname)
  const html = template({ start: 5 })

  assert(html.includes('<div class="c1">'))
  assert(html.includes('<span class="c2">5</span>'))
  assert(html.includes('<button class="c3" type="button">+1</button>'))
  assert(html.includes("<style>"))
  assert(html.includes(".c3{cursor:pointer}"))
})

test("#reactivity/counter: it starts at zero by default", async () => {
  const { value } = await render()

  assert.strictEqual(value.textContent, "0")
})

test("#reactivity/counter: it emits a single, parseable bundle", async () => {
  const { template } = await compile(__dirname)

  // Throws when the page carries more than one inline script, or when the
  // emitted bundle is not valid JavaScript.
  const tree = parseInlineScript(template({}))
  assert(tree.body.length > 0)
})

test("#reactivity/counter: clicking the button increments the rendered value", async () => {
  const { value, click } = await render({ start: 5 })

  // The client picks the state up from the server rendered markup.
  assert.strictEqual(value.textContent, "5")

  click()
  assert.strictEqual(value.textContent, "6")

  click()
  click()
  assert.strictEqual(value.textContent, "8")
})

test("#reactivity/counter: running the bundle twice does not stack listeners", async () => {
  const { dom, value, click } = await render({ start: 5 })

  // A second run must not register a single new listener.
  assert.strictEqual(runBundleAgain(dom), 0)

  click()
  assert.strictEqual(value.textContent, "6")
})
