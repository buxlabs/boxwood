const test = require("node:test")
const assert = require("node:assert")
const { JSDOM } = require("jsdom")
const { runBundleAgain } = require("../../reactivity/helpers")
const { parseInlineScript } = require("../../scripts/helpers")
const { markup, open, todo } = require("./helpers")

const TODOS = [todo(1, "buy milk"), todo(2, "walk dog", true)]

test("#apps/todomvc: the server renders the list it was given", () => {
  const html = markup({ todos: TODOS })

  assert(html.includes('<li data-item="" data-id="1">'))
  assert(html.includes('<li data-item="" data-id="2" data-completed="">'))
  assert(html.includes('<label data-title="">buy milk</label>'))
  assert(html.includes('type="checkbox" data-action="toggle" checked'))
})

test("#apps/todomvc: the count is server rendered, in a strong tag", () => {
  assert(markup({ todos: TODOS }).includes("<strong>1</strong> item left"))
  assert(
    markup({ todos: [todo(1, "a"), todo(2, "b")] }).includes(
      "<strong>2</strong> items left",
    ),
  )
})

/*
 * "When there are no todos, #main and #footer should be hidden." Asserted
 * through the cascade rather than the attribute, because hiding is what the
 * requirement is about.
 */
test("#apps/todomvc: an empty app hides the list and the toolbar", () => {
  const { visible } = open({ todos: [] })

  assert.strictEqual(visible("[data-main]"), false)
  assert.strictEqual(visible("[data-footer]"), false)
})

test("#apps/todomvc: an app with todos shows them", () => {
  const { visible, titles } = open({ todos: TODOS })

  assert.strictEqual(visible("[data-main]"), true)
  assert.strictEqual(visible("[data-footer]"), true)
  assert.deepStrictEqual(titles(), ["buy milk", "walk dog"])
})

test("#apps/todomvc: the new todo field is focused on load", () => {
  // Spec: "preferably by using the autofocus input attribute".
  assert(markup().includes("autofocus"))
})

test("#apps/todomvc: a completed todo is struck through", () => {
  const { window, item } = open({ todos: TODOS })
  const title = (index) => item(index).querySelector("[data-title]")

  assert.strictEqual(
    window.getComputedStyle(title(1)).textDecoration,
    "line-through",
  )
  assert.notStrictEqual(
    window.getComputedStyle(title(0)).textDecoration,
    "line-through",
  )
})

/*
 * The one that would break first. An item's markup is written twice - once as
 * boxwood nodes for the server, once as DOM calls for the browser - and
 * nothing but this test says the two agree.
 */
test("#apps/todomvc: an item built in the browser matches one the server drew", () => {
  const server = new JSDOM(markup({ todos: TODOS })).window.document
  const { document } = open({ todos: TODOS })

  const shape = (element) => ({
    name: element.tagName,
    attributes: Array.from(element.attributes)
      .map((attribute) => `${attribute.name}=${attribute.value}`)
      .sort(),
    text: element.textContent,
    children: Array.from(element.children).map(shape),
  })

  assert.deepStrictEqual(
    Array.from(document.querySelectorAll("[data-item]")).map(shape),
    Array.from(server.querySelectorAll("[data-item]")).map(shape),
  )
})

test("#apps/todomvc: the count the browser draws matches the server's", () => {
  const server = new JSDOM(markup({ todos: TODOS })).window.document
  const { one } = open({ todos: TODOS })

  assert.strictEqual(
    one("[data-count]").innerHTML,
    server.querySelector("[data-count]").innerHTML,
  )
})

test("#apps/todomvc: a title is never read as markup", () => {
  const attack = "<img src=x onerror=alert(1)>"
  const { titles, all, submit } = open({ todos: [todo(1, attack)] })

  assert.deepStrictEqual(titles(), [attack])
  submit(attack)
  assert.deepStrictEqual(titles(), [attack, attack])
  assert.strictEqual(all("img").length, 0)
})

test("#apps/todomvc: the page carries one script, and it parses", () => {
  const tree = parseInlineScript(markup({ todos: TODOS }))

  assert(tree.body.length > 0)
})

test("#apps/todomvc: nothing the app is built from becomes a global", () => {
  const { window } = open({ todos: TODOS })

  for (const name of ["start", "create", "load", "save", "filtered", "add"]) {
    assert.strictEqual(name in window, false, `${name} leaked`)
  }
})

test("#apps/todomvc: running the bundle twice does not stack listeners", () => {
  const { dom, titles, submit } = open({ todos: TODOS })

  assert.strictEqual(runBundleAgain(dom), 0)

  submit("write tests")
  assert.deepStrictEqual(titles(), ["buy milk", "walk dog", "write tests"])
})
