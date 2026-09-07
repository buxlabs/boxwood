const test = require("node:test")
const assert = require("node:assert")
const { join } = require("path")
const { JSDOM } = require("jsdom")
const { compile } = require("../../..")

test("#pages/documentation: it returns a page with an accordion", async () => {
  const { template } = await compile(join(__dirname, "./index.js"))
  const html = template()

  assert(html.includes("Accordion"))
  // The accordion's enhancement is loaded from client.js and emitted into the
  // page body. A fragment carries no script, so this page is where it lands.
  assert(html.includes("[data-accordion]"))
})

test("#pages/documentation: the accordion's enhancement toggles on click", async () => {
  const { template } = await compile(join(__dirname, "./index.js"))
  const html = template()

  // runScripts: "dangerously" executes the embedded <script> as the doc parses.
  const dom = new JSDOM(html, { runScripts: "dangerously" })
  const { document } = dom.window
  const header = document.querySelector("h3")
  const panel = header.nextElementSibling

  // Visibility rather than class names: the state is an attribute now, and
  // what matters is that the stylesheet acts on it.
  const visible = () => dom.window.getComputedStyle(panel).display !== "none"

  const click = () =>
    header.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }))

  assert.strictEqual(visible(), false)
  click()
  assert.strictEqual(visible(), true)
  click()
  assert.strictEqual(visible(), false)
})
