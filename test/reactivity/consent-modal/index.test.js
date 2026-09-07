const test = require("node:test")
const assert = require("node:assert")
const { JSDOM } = require("jsdom")
const { compile } = require("../../..")
const { runBundleAgain } = require("../helpers")
const { parseInlineScript } = require("../../scripts/helpers")

async function render({ consent = null } = {}) {
  const { template } = await compile(__dirname)
  const dom = new JSDOM(template(), {
    // localStorage needs a real origin; about:blank has none.
    url: "https://example.com",
    // runScripts: "dangerously" executes the embedded <script> as the doc parses.
    runScripts: "dangerously",
    // beforeParse runs before the script does, which is how a returning
    // visitor is simulated.
    beforeParse(window) {
      if (consent !== null) window.localStorage.setItem("consent", consent)
    },
  })
  const { document } = dom.window

  const modal = document.querySelector("[role=dialog]")
  const options = modal.querySelector("div")
  const stored = () => dom.window.localStorage.getItem("consent")

  // The generated class names are not the point - asking the cascade whether
  // the element ends up displayed is, and jsdom resolves the inlined stylesheet.
  const visible = (element) =>
    dom.window.getComputedStyle(element).display !== "none"

  function click(selector) {
    document
      .querySelector(selector)
      .dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }))
  }

  function check(selector) {
    document.querySelector(selector).checked = true
  }

  return { dom, document, modal, options, stored, visible, click, check }
}

test("#reactivity/consent-modal: it renders the modal open with scoped styles", async () => {
  const { template } = await compile(__dirname)
  const html = template()

  assert(
    html.includes(
      '<div class="c1" data-modal="" role="dialog" aria-modal="true"',
    ),
  )
  assert(
    html.includes('<button type="button" data-accept="">Accept all</button>'),
  )
  assert(html.includes('<button type="button" data-save="" data-hidden="">'))
  // The state rule hangs off the modal rather than a standalone class, and it
  // covers the modal itself as well as what is inside it.
  assert(html.includes(".c1[data-hidden]"))
  assert(html.includes(".c1 [data-hidden]{display:none}"))
  // The modal itself carries no hidden class: a first visit sees it open.
  assert(!html.includes('class="c1 c5"'))
})

test("#reactivity/consent-modal: it emits a single, parseable bundle", async () => {
  const { template } = await compile(__dirname)

  // Throws when the page carries more than one inline script, or when the
  // emitted bundle is not valid JavaScript.
  const tree = parseInlineScript(template())
  assert(tree.body.length > 0)
})

test("#reactivity/consent-modal: accepting stores every category and closes", async () => {
  const { modal, stored, visible, click } = await render()

  assert.strictEqual(visible(modal), true)
  assert.strictEqual(stored(), null)

  click("[data-accept]")

  assert.strictEqual(visible(modal), false)
  assert.strictEqual(stored(), "analytics,marketing")
})

test("#reactivity/consent-modal: rejecting stores an empty decision and closes", async () => {
  const { modal, stored, visible, click } = await render()

  click("[data-reject]")

  assert.strictEqual(visible(modal), false)
  // An empty string is still a decision - it is not the same as null.
  assert.strictEqual(stored(), "")
})

test("#reactivity/consent-modal: managing reveals the options and saves the selection", async () => {
  const { document, options, modal, stored, visible, click, check } =
    await render()

  assert.strictEqual(visible(options), false)
  assert.strictEqual(visible(document.querySelector("[data-save]")), false)

  click("[data-manage]")

  assert.strictEqual(visible(options), true)
  assert.strictEqual(visible(document.querySelector("[data-save]")), true)
  assert.strictEqual(visible(document.querySelector("[data-manage]")), false)

  check("[data-analytics]")
  click("[data-save]")

  assert.strictEqual(visible(modal), false)
  assert.strictEqual(stored(), "analytics")
})

test("#reactivity/consent-modal: a stored decision closes the modal on load", async () => {
  const { document, modal, visible } = await render({ consent: "analytics" })

  assert.strictEqual(visible(modal), false)
  // The checkboxes are restored from the stored decision.
  assert.strictEqual(document.querySelector("[data-analytics]").checked, true)
  assert.strictEqual(document.querySelector("[data-marketing]").checked, false)
})

test("#reactivity/consent-modal: the footer button reopens a closed modal", async () => {
  const { modal, visible, click } = await render({ consent: "" })

  assert.strictEqual(visible(modal), false)

  click("[data-reopen]")
  assert.strictEqual(visible(modal), true)

  click("[data-accept]")
  assert.strictEqual(visible(modal), false)
})

test("#reactivity/consent-modal: running the bundle twice does not stack listeners", async () => {
  const { dom, modal, stored, visible, click } = await render()

  // A second run must not register a single new listener.
  assert.strictEqual(runBundleAgain(dom), 0)

  click("[data-accept]")
  assert.strictEqual(visible(modal), false)
  assert.strictEqual(stored(), "analytics,marketing")

  click("[data-reopen]")
  assert.strictEqual(visible(modal), true)
})
