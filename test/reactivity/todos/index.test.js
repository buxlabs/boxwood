const test = require("node:test")
const assert = require("node:assert")
const { JSDOM } = require("jsdom")
const { compile } = require("../../..")
const { runBundleAgain } = require("../helpers")
const { parseInlineScript } = require("../../scripts/helpers")

const TODOS = [
  { description: "buy milk", done: false },
  { description: "walk dog", done: true },
]

async function render(todos = TODOS) {
  const { template } = await compile(__dirname)
  // runScripts: "dangerously" executes the embedded <script> as the doc parses.
  const dom = new JSDOM(template({ todos }), { runScripts: "dangerously" })
  const { document } = dom.window

  const list = document.querySelector("ul")
  const input = document.querySelector("[data-new-todo]")
  const remaining = () => document.querySelector("body > span").textContent
  const descriptions = () =>
    [...list.querySelectorAll("li span")].map((span) => span.textContent)

  // The generated class names are not the point - asking the cascade whether
  // the element ends up displayed is, and jsdom resolves the inlined stylesheet.
  const empty = document.querySelector("p")
  const emptyVisible = () =>
    dom.window.getComputedStyle(empty).display !== "none"
  // Done is a state the script writes, so it is an attribute rather than a
  // second class name.
  const done = (index) =>
    [...list.querySelectorAll("li")][index].hasAttribute("data-done")

  function add(description) {
    input.value = description
    document
      .querySelector("[data-new-todo-form]")
      .dispatchEvent(
        new dom.window.Event("submit", { bubbles: true, cancelable: true }),
      )
  }

  function toggle(index) {
    const checkbox = list.querySelectorAll("input[data-action=toggle]")[index]
    checkbox.checked = !checkbox.checked
    checkbox.dispatchEvent(new dom.window.Event("change", { bubbles: true }))
  }

  function remove(index) {
    list
      .querySelectorAll("button[data-action=remove]")
      [index].dispatchEvent(
        new dom.window.MouseEvent("click", { bubbles: true }),
      )
  }

  return {
    dom,
    document,
    list,
    input,
    remaining,
    descriptions,
    emptyVisible,
    done,
    add,
    toggle,
    remove,
  }
}

test("#reactivity/todos: it renders the initial items and the derived count", async () => {
  const { template } = await compile(__dirname)
  const html = template({ todos: TODOS })

  assert(html.includes("<span>buy milk</span>"))
  assert(html.includes('<li data-item="" data-done="">')) // walk dog is done
  assert(html.includes('type="checkbox" data-action="toggle" checked'))
  assert(html.includes('<span class="c2" data-remaining="">1 remaining</span>'))
  // The empty message stays hidden.
  assert(html.includes('<p class="c3" data-empty="" data-hidden="">'))
})

test("#reactivity/todos: it emits a single, parseable bundle", async () => {
  const { template } = await compile(__dirname)

  // Throws when the page carries more than one inline script, or when the
  // emitted bundle is not valid JavaScript.
  const tree = parseInlineScript(template({ todos: TODOS }))
  assert(tree.body.length > 0)
})

test("#reactivity/todos: the client agrees with the server rendered count", async () => {
  const { remaining } = await render()

  // sync() runs on load and must not disagree with what the server wrote.
  assert.strictEqual(remaining(), "1 remaining")
})

test("#reactivity/todos: adding appends an item, clears the input and recounts", async () => {
  const { descriptions, remaining, input, add } = await render()

  add("write tests")

  assert.deepStrictEqual(descriptions(), [
    "buy milk",
    "walk dog",
    "write tests",
  ])
  assert.strictEqual(remaining(), "2 remaining")
  assert.strictEqual(input.value, "")
})

test("#reactivity/todos: adding nothing is not adding", async () => {
  const { descriptions, remaining, add } = await render()

  add("")
  add("   ")

  assert.deepStrictEqual(descriptions(), ["buy milk", "walk dog"])
  assert.strictEqual(remaining(), "1 remaining")
})

test("#reactivity/todos: toggling marks the item and recounts both ways", async () => {
  const { done, remaining, toggle } = await render()

  toggle(0)
  assert.strictEqual(done(0), true)
  assert.strictEqual(remaining(), "0 remaining")

  toggle(1)
  assert.strictEqual(done(1), false)
  assert.strictEqual(remaining(), "1 remaining")
})

test("#reactivity/todos: removing drops the item and recounts", async () => {
  const { descriptions, remaining, remove } = await render()

  remove(1)
  assert.deepStrictEqual(descriptions(), ["buy milk"])
  assert.strictEqual(remaining(), "1 remaining")

  remove(0)
  assert.deepStrictEqual(descriptions(), [])
  assert.strictEqual(remaining(), "0 remaining")
})

/*
 * The one that would break first: an item added after load was never present
 * when listeners were attached, so it only works because the list delegates.
 */
test("#reactivity/todos: an item added after load can be toggled and removed", async () => {
  const { descriptions, remaining, done, add, toggle, remove } = await render(
    [],
  )

  add("write tests")
  assert.deepStrictEqual(descriptions(), ["write tests"])
  assert.strictEqual(remaining(), "1 remaining")

  toggle(0)
  assert.strictEqual(done(0), true)
  assert.strictEqual(remaining(), "0 remaining")

  remove(0)
  assert.deepStrictEqual(descriptions(), [])
})

test("#reactivity/todos: the empty message follows the list", async () => {
  const { emptyVisible, add, remove } = await render([])

  assert.strictEqual(emptyVisible(), true)

  add("write tests")
  assert.strictEqual(emptyVisible(), false)

  remove(0)
  assert.strictEqual(emptyVisible(), true)
})

test("#reactivity/todos: a description is never read as markup", async () => {
  const { list, descriptions, add } = await render([])

  add("<img src=x onerror=alert(1)>")

  assert.deepStrictEqual(descriptions(), ["<img src=x onerror=alert(1)>"])
  assert.strictEqual(list.querySelectorAll("img").length, 0)
})

/*
 * Stacked listeners are invisible here by accident: the first submit handler
 * clears the input, so the second one reads an empty field and gives up. That
 * is exactly why the assertion counts registrations instead of items.
 */
test("#reactivity/todos: running the bundle twice does not stack listeners", async () => {
  const { dom, descriptions, remaining, add } = await render([])

  // A second run must not register a single new listener.
  assert.strictEqual(runBundleAgain(dom), 0)

  add("write tests")
  assert.deepStrictEqual(descriptions(), ["write tests"])
  assert.strictEqual(remaining(), "1 remaining")
})
