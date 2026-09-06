const test = require("node:test")
const assert = require("node:assert")
const { JSDOM } = require("jsdom")
const { compile } = require("../../..")
const { runBundleAgain } = require("../helpers")
const { parseInlineScript } = require("../../scripts/helpers")

// Longer than the debounce in index.js, short enough to stay out of the way.
const SETTLED = 60

const settle = (ms = SETTLED) => new Promise((resolve) => setTimeout(resolve, ms))

const body = (results) => ({ json: () => Promise.resolve({ results }) })

/*
 * jsdom has no fetch, which is convenient here - the stub is the seam. It
 * records every call and hands back whatever the test decides, including a
 * promise the test resolves by hand.
 */
async function render({ results = [], respond = () => Promise.resolve(body([])) } = {}) {
  const { template } = await compile(__dirname)
  const calls = []

  const dom = new JSDOM(template({ results }), {
    url: "https://example.com",
    // runScripts: "dangerously" executes the embedded <script> as the doc parses.
    runScripts: "dangerously",
    beforeParse(window) {
      window.fetch = function (url) {
        calls.push(url)
        return respond(url, calls.length)
      }
    },
  })
  const { document } = dom.window

  const input = document.querySelector("#query")
  const [loader, message] = document.querySelectorAll("p")
  const titles = () =>
    [...document.querySelectorAll("li")].map((item) => item.textContent)

  // The generated class names are not the point - asking the cascade whether
  // the element ends up displayed is, and jsdom resolves the inlined stylesheet.
  const visible = (element) =>
    dom.window.getComputedStyle(element).display !== "none"

  function type(value) {
    input.value = value
    input.dispatchEvent(new dom.window.Event("input", { bubbles: true }))
  }

  return { dom, document, calls, input, loader, message, titles, visible, type }
}

test("#reactivity/search: it renders the server results and an idle page", async () => {
  const { template } = await compile(__dirname)
  const html = template({ results: [{ title: "boxwood" }] })

  assert(html.includes('<li class="c3">boxwood</li>'))
  assert(html.includes('<p class="c4 c6">Loading...</p>')) // loader starts hidden
  assert(html.includes('<p class="c5 c6"></p>')) // and so does the message
})

test("#reactivity/search: it emits a single, parseable bundle", async () => {
  const { template } = await compile(__dirname)

  // Throws when the page carries more than one inline script, or when the
  // emitted bundle is not valid JavaScript.
  const tree = parseInlineScript(template({ results: [] }))
  assert(tree.body.length > 0)
})

test("#reactivity/search: typing is debounced into a single request", async () => {
  const { calls, type } = await render({ respond: () => Promise.resolve(body([])) })

  type("b")
  type("bo")
  type("box")
  assert.deepStrictEqual(calls, []) // nothing goes out mid-word

  await settle()
  assert.deepStrictEqual(calls, ["/search?q=box"])
})

test("#reactivity/search: a query goes through loading and into results", async () => {
  let resolve
  const pending = new Promise((r) => {
    resolve = r
  })
  const { loader, titles, visible, type } = await render({
    respond: () => pending,
  })

  type("box")
  await settle()

  assert.strictEqual(visible(loader), true)
  assert.deepStrictEqual(titles(), [])

  resolve(body([{ title: "boxwood" }, { title: "boxwood ui" }]))
  await settle(0)

  assert.strictEqual(visible(loader), false)
  assert.deepStrictEqual(titles(), ["boxwood", "boxwood ui"])
})

test("#reactivity/search: no results says so instead of showing an empty list", async () => {
  const { message, titles, visible, type } = await render({
    respond: () => Promise.resolve(body([])),
  })

  type("nothing")
  await settle()

  assert.deepStrictEqual(titles(), [])
  assert.strictEqual(visible(message), true)
  assert.strictEqual(message.textContent, "No results for nothing")
})

test("#reactivity/search: a failed request reports and stops loading", async () => {
  const { loader, message, visible, type } = await render({
    respond: () => Promise.reject(new Error("offline")),
  })

  type("box")
  await settle()

  assert.strictEqual(visible(loader), false)
  assert.strictEqual(visible(message), true)
  assert.strictEqual(message.textContent, "Something went wrong")
})

test("#reactivity/search: clearing the field resets the page without a request", async () => {
  const { calls, message, titles, visible, type } = await render({
    respond: () => Promise.resolve(body([{ title: "boxwood" }])),
  })

  type("box")
  await settle()
  assert.deepStrictEqual(titles(), ["boxwood"])

  type("   ")
  await settle()

  assert.deepStrictEqual(titles(), [])
  assert.strictEqual(visible(message), false)
  assert.strictEqual(calls.length, 1) // whitespace is not a query
})

/*
 * The one that only shows up on a slow connection: the answer to an abandoned
 * query arrives last and must not overwrite what the user is looking at.
 */
test("#reactivity/search: a stale response never lands", async () => {
  const deferred = []
  const { calls, titles, type } = await render({
    respond: () =>
      new Promise((resolve) => {
        deferred.push(resolve)
      }),
  })

  type("box")
  await settle()
  type("boxwood")
  await settle()

  assert.deepStrictEqual(calls, ["/search?q=box", "/search?q=boxwood"])

  // The newer query answers first, the abandoned one crawls in afterwards.
  deferred[1](body([{ title: "boxwood" }]))
  await settle(0)
  deferred[0](body([{ title: "a stale hit" }]))
  await settle(0)

  assert.deepStrictEqual(titles(), ["boxwood"])
})

test("#reactivity/search: a result title is never read as markup", async () => {
  const { document, titles, type } = await render({
    respond: () =>
      Promise.resolve(body([{ title: "<img src=x onerror=alert(1)>" }])),
  })

  type("box")
  await settle()

  assert.deepStrictEqual(titles(), ["<img src=x onerror=alert(1)>"])
  assert.strictEqual(document.querySelectorAll("img").length, 0)
})

test("#reactivity/search: running the bundle twice does not stack listeners", async () => {
  const { dom, calls, titles, type } = await render({
    respond: () => Promise.resolve(body([{ title: "boxwood" }])),
  })

  // A second run must not register a single new listener.
  assert.strictEqual(runBundleAgain(dom), 0)

  type("box")
  await settle()

  assert.deepStrictEqual(calls, ["/search?q=box"])
  assert.deepStrictEqual(titles(), ["boxwood"])
})
