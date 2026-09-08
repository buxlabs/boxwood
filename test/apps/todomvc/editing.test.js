const test = require("node:test")
const assert = require("node:assert")
const { open, todo } = require("./helpers")

const TODOS = [todo(1, "buy milk"), todo(2, "walk dog", true)]

test("#apps/todomvc: double clicking a title starts an edit", () => {
  const { window, item, editor, edit } = open({ todos: TODOS })

  edit(0)

  assert.strictEqual(item(0).hasAttribute("data-editing"), true)
  assert.strictEqual(editor().value, "buy milk")
  // "which should be focused"
  assert.strictEqual(window.document.activeElement, editor())
})

test("#apps/todomvc: editing hides the rest of the row", () => {
  const { window, item, editor, edit } = open({ todos: TODOS })
  const shown = (element) => window.getComputedStyle(element).display !== "none"

  edit(0)

  assert.strictEqual(shown(item(0).querySelector("[data-title]")), false)
  const control = (name) => item(0).querySelector(`[data-action=${name}]`)
  assert.strictEqual(shown(control("toggle")), false)
  assert.strictEqual(shown(control("destroy")), false)
  assert.strictEqual(shown(editor()), true)
})

test("#apps/todomvc: enter saves the edit", () => {
  const { titles, items, editor, edit, key } = open({ todos: TODOS })

  edit(0)
  editor().value = "buy oat milk"
  key("Enter")

  assert.deepStrictEqual(titles(), ["buy oat milk", "walk dog"])
  assert.strictEqual(items()[0].hasAttribute("data-editing"), false)
})

test("#apps/todomvc: blur saves the edit", () => {
  const { titles, items, editor, edit, blur } = open({ todos: TODOS })

  edit(0)
  editor().value = "buy oat milk"
  blur()

  assert.deepStrictEqual(titles(), ["buy oat milk", "walk dog"])
  assert.strictEqual(items()[0].hasAttribute("data-editing"), false)
})

test("#apps/todomvc: an edit is trimmed", () => {
  const { titles, editor, edit, key } = open({ todos: TODOS })

  edit(0)
  editor().value = "   buy oat milk   "
  key("Enter")

  assert.deepStrictEqual(titles(), ["buy oat milk", "walk dog"])
})

test("#apps/todomvc: emptying a todo destroys it", () => {
  const { titles, count, editor, edit, key } = open({ todos: TODOS })

  edit(0)
  editor().value = "   "
  key("Enter")

  assert.deepStrictEqual(titles(), ["walk dog"])
  assert.strictEqual(count(), "0 items left")
})

test("#apps/todomvc: emptying a todo and blurring destroys it too", () => {
  const { titles, editor, edit, blur } = open({ todos: TODOS })

  edit(0)
  editor().value = ""
  blur()

  assert.deepStrictEqual(titles(), ["walk dog"])
})

test("#apps/todomvc: escape discards the edit", () => {
  const { titles, items, editor, edit, key } = open({ todos: TODOS })

  edit(0)
  editor().value = "something else"
  key("Escape")

  assert.deepStrictEqual(titles(), ["buy milk", "walk dog"])
  assert.strictEqual(items()[0].hasAttribute("data-editing"), false)
})

/*
 * A blur can arrive from a field that is not the one being edited: every row
 * carries an edit field, hidden rather than absent, and browsers do not agree
 * on what happens to focus when a row is redrawn underneath it. Read from the
 * state instead of from the event, this saved one todo's text onto another.
 */
test("#apps/todomvc: a blur from another row's field saves nothing", () => {
  const { titles, item, edit, blurField } = open({ todos: TODOS })

  edit(0)
  item(1).querySelector("[data-edit]").value = "something else"
  blurField(1)

  assert.deepStrictEqual(titles(), ["buy milk", "walk dog"])
  assert.strictEqual(item(0).hasAttribute("data-editing"), true)
})

test("#apps/todomvc: editing one todo after another saves each to itself", () => {
  const { titles, editor, edit, key } = open({ todos: TODOS })

  edit(0)
  editor().value = "buy oat milk"
  key("Enter")

  edit(1)
  editor().value = "walk the dog"
  key("Enter")

  assert.deepStrictEqual(titles(), ["buy oat milk", "walk the dog"])
})

test("#apps/todomvc: a completed todo can be edited", () => {
  const { titles, completed, editor, edit, key } = open({ todos: TODOS })

  edit(1)
  editor().value = "walk the dog"
  key("Enter")

  assert.deepStrictEqual(titles(), ["buy milk", "walk the dog"])
  assert.deepStrictEqual(completed(), [false, true])
})

test("#apps/todomvc: an edit is never read as markup", () => {
  const { titles, all, editor, edit, key } = open({ todos: TODOS })

  edit(0)
  editor().value = "<img src=x onerror=alert(1)>"
  key("Enter")

  assert.deepStrictEqual(titles(), ["<img src=x onerror=alert(1)>", "walk dog"])
  assert.strictEqual(all("img").length, 0)
})
