const test = require("node:test")
const assert = require("node:assert")
const { JSDOM } = require("jsdom")
const { compile } = require("../../..")
const { runBundleAgain } = require("../helpers")
const { inlineScripts, parseInlineScript } = require("../../scripts/helpers")

const PRODUCTS = [
  { id: "a", name: "Hedge trimmer", price: 9.99 },
  { id: "b", name: "Watering can", price: 4.5 },
  { id: "c", name: "Gloves", price: 12 },
]

async function render(products = PRODUCTS) {
  const { template } = await compile(__dirname)
  // runScripts: "dangerously" executes the embedded <script> as the doc parses.
  const dom = new JSDOM(template({ products }), { runScripts: "dangerously" })
  const { document } = dom.window

  const cart = document.querySelector("header")
  const count = () => cart.querySelectorAll("span")[0].textContent
  const total = () => cart.querySelectorAll("span")[2].textContent
  const tallies = () =>
    [...document.querySelectorAll("div > span:last-child")].map(
      (span) => span.textContent,
    )

  const click = (element) =>
    element.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }))

  const add = (id) => click(document.querySelector(`[data-id=${id}] button`))
  const clear = () => click(cart.querySelector("button"))

  return { dom, document, cart, count, total, tallies, add, clear }
}

test("#reactivity/cart: it renders an empty badge and one row per product", async () => {
  const { template } = await compile(__dirname)
  const html = template({ products: PRODUCTS })

  assert(html.includes('<span class="c2" data-count="">0</span>'))
  assert(html.includes('<span class="c3" data-total="">$0.00</span>'))
  assert(
    html.includes(
      '<button type="button" data-add="" data-price="9.99">Add</button>',
    ),
  )
  assert.strictEqual(html.match(/data-product=""/g).length, 3)
})

test("#reactivity/cart: two components merge into one parseable bundle", async () => {
  const { template } = await compile(__dirname)
  const html = template({ products: PRODUCTS })

  assert.strictEqual(inlineScripts(html).length, 1)

  // Both components declare a `render` of their own - inside their own
  // callback, so scoping already keeps them apart. Throws when the merged
  // bundle is not valid JavaScript.
  const tree = parseInlineScript(html)
  assert(tree.body.length > 0)
})

test("#reactivity/cart: adding a product reaches the badge", async () => {
  const { count, total, add } = await render()

  add("a")

  assert.strictEqual(count(), "1")
  assert.strictEqual(total(), "$9.99")
})

test("#reactivity/cart: the badge sums across products and repeats", async () => {
  const { count, total, add } = await render()

  add("a")
  add("b")
  assert.strictEqual(count(), "2")
  assert.strictEqual(total(), "$14.49")

  add("c")
  add("c")
  assert.strictEqual(count(), "4")
  assert.strictEqual(total(), "$38.49")
})

test("#reactivity/cart: every product keeps its own tally", async () => {
  const { tallies, add } = await render()

  assert.deepStrictEqual(tallies(), ["", "", ""])

  add("b")
  assert.deepStrictEqual(tallies(), ["", "added 1x", ""])

  add("b")
  add("c")
  assert.deepStrictEqual(tallies(), ["", "added 2x", "added 1x"])
})

/*
 * The direction that is easy to forget: clearing is owned by the badge, but it
 * has to reach back into components the badge does not know exist.
 */
test("#reactivity/cart: clearing resets the badge and every product", async () => {
  const { count, total, tallies, add, clear } = await render()

  add("a")
  add("b")
  add("b")
  assert.strictEqual(count(), "3")
  assert.deepStrictEqual(tallies(), ["added 1x", "added 2x", ""])

  clear()

  assert.strictEqual(count(), "0")
  assert.strictEqual(total(), "$0.00")
  assert.deepStrictEqual(tallies(), ["", "", ""])
})

test("#reactivity/cart: the page keeps working after a clear", async () => {
  const { count, total, tallies, add, clear } = await render()

  add("a")
  clear()
  add("c")

  assert.strictEqual(count(), "1")
  assert.strictEqual(total(), "$12.00")
  assert.deepStrictEqual(tallies(), ["", "", "added 1x"])
})

test("#reactivity/cart: a badge with no products on the page still loads", async () => {
  const { count, total, tallies, clear } = await render([])

  assert.deepStrictEqual(tallies(), [])
  clear() // nothing listens for cart:cleared, which must not be an error

  assert.strictEqual(count(), "0")
  assert.strictEqual(total(), "$0.00")
})

/*
 * Before the guard, this was the fixture that showed the damage: one click
 * counted twice and charged twice.
 */
test("#reactivity/cart: running the bundle twice does not stack listeners", async () => {
  const { dom, count, total, tallies, add } = await render()

  // A second run must not register a single new listener.
  assert.strictEqual(runBundleAgain(dom), 0)

  add("a")
  assert.strictEqual(count(), "1")
  assert.strictEqual(total(), "$9.99")
  assert.deepStrictEqual(tallies(), ["added 1x", "", ""])
})
