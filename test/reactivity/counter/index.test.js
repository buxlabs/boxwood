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

  // Classes for the stylesheet, data attributes for the script.
  assert(html.includes('<div class="c1" data-counter="">'))
  assert(html.includes('<span class="c2" data-value="">5</span>'))
  assert(
    html.includes(
      '<button class="c3" data-increment="" type="button">+1</button>',
    ),
  )
  // The guard is a property, so it leaves nothing behind in the markup.
  assert(!html.includes("data-ready"))
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

test("#reactivity/counter: it rewires after the markup is replaced", async () => {
  const { dom, click } = await render({ start: 5 })
  const { window } = dom
  const { document } = window

  click()
  assert.strictEqual(document.querySelector("span").textContent, "6")

  // What a soft navigation does: the DOM is rebuilt from HTML, so every
  // listener is gone even though the markup looks identical. Re-running the
  // bundle has to wire it up again.
  //
  // A guard written as an attribute fails exactly here - it is serialised
  // into the markup, survives the rebuild, and convinces the script the
  // elements are already wired. The counter comes back permanently dead.
  document.body.innerHTML = document.body.innerHTML
  const script = document.createElement("script")
  script.textContent = document.querySelector("script").textContent
  document.body.appendChild(script)

  document
    .querySelector("button")
    .dispatchEvent(new window.MouseEvent("click", { bubbles: true }))

  assert.strictEqual(document.querySelector("span").textContent, "7")
})
