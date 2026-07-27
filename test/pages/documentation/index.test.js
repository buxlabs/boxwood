const test = require("node:test")
const assert = require("node:assert")
const { join } = require("path")
const { JSDOM } = require("jsdom")
const { compile } = require("../../..")

test("#pages/documentation: it returns a page with an accordion", async () => {
  const { template } = await compile(join(__dirname, "./index.js"))
  const html = template()
  assert(html.includes("Accordion"))
  // The accordion's inline enhancement script is emitted into the page body.
  assert(html.includes("header.nextElementSibling.classList.toggle"))
})

test("#pages/documentation: the accordion's querySelectorAll enhancement toggles on click", async () => {
  const { template } = await compile(join(__dirname, "./index.js"))
  const html = template()

  // runScripts: "dangerously" executes the embedded <script> as the doc parses.
  const dom = new JSDOM(html, { runScripts: "dangerously" })
  const { document } = dom.window
  const header = document.querySelector("h3") // the accordion header
  const panel = header.nextElementSibling // content + hidden classes
  const collapsed = panel.className

  // Starts collapsed: content + hidden classes present.
  assert.strictEqual(panel.classList.length, 2)

  const click = () =>
    header.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }))

  click()
  assert.strictEqual(panel.classList.length, 1) // hidden class removed -> expanded

  click()
  assert.strictEqual(panel.className, collapsed) // toggled back to collapsed
})
