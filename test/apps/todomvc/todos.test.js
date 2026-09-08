const test = require("node:test")
const assert = require("node:assert")
const { open, todo } = require("./helpers")

const TODOS = [todo(1, "buy milk"), todo(2, "walk dog", true)]

test("#apps/todomvc: submitting appends a todo and clears the field", () => {
  const { titles, one, submit } = open({ todos: TODOS })

  submit("write tests")

  assert.deepStrictEqual(titles(), ["buy milk", "walk dog", "write tests"])
  assert.strictEqual(one("[data-new-todo]").value, "")
})

test("#apps/todomvc: a new todo starts active", () => {
  const { completed, count, submit } = open({ todos: [] })

  submit("write tests")

  assert.deepStrictEqual(completed(), [false])
  assert.strictEqual(count(), "1 item left")
})

test("#apps/todomvc: a title is trimmed", () => {
  const { titles, submit } = open({ todos: [] })

  submit("  write tests  ")

  assert.deepStrictEqual(titles(), ["write tests"])
})

test("#apps/todomvc: an empty title is not a todo", () => {
  const { titles, submit } = open({ todos: [] })

  submit("")
  submit("   ")

  assert.deepStrictEqual(titles(), [])
})

test("#apps/todomvc: the first todo brings the list and the toolbar back", () => {
  const { visible, submit, destroy } = open({ todos: [] })

  assert.strictEqual(visible("[data-main]"), false)

  submit("write tests")
  assert.strictEqual(visible("[data-main]"), true)
  assert.strictEqual(visible("[data-footer]"), true)

  destroy(0)
  assert.strictEqual(visible("[data-main]"), false)
  assert.strictEqual(visible("[data-footer]"), false)
})

test("#apps/todomvc: the checkbox completes a todo, and uncompletes it", () => {
  const { completed, count, toggle } = open({ todos: TODOS })

  toggle(0)
  assert.deepStrictEqual(completed(), [true, true])
  assert.strictEqual(count(), "0 items left")

  toggle(1)
  assert.deepStrictEqual(completed(), [true, false])
  assert.strictEqual(count(), "1 item left")
})

test("#apps/todomvc: the destroy button removes a todo", () => {
  const { titles, destroy } = open({ todos: TODOS })

  destroy(1)
  assert.deepStrictEqual(titles(), ["buy milk"])

  destroy(0)
  assert.deepStrictEqual(titles(), [])
})

/*
 * A todo added after load was never around when the listeners were attached,
 * so it only works because the list delegates.
 */
test("#apps/todomvc: a todo added after load can be completed and removed", () => {
  const { titles, completed, submit, toggle, destroy } = open({ todos: [] })

  submit("write tests")
  toggle(0)
  assert.deepStrictEqual(completed(), [true])

  destroy(0)
  assert.deepStrictEqual(titles(), [])
})

test("#apps/todomvc: the count pluralises", () => {
  const { count, toggle, submit } = open({ todos: [] })

  assert.strictEqual(count(), "0 items left")

  submit("one")
  assert.strictEqual(count(), "1 item left")

  submit("two")
  assert.strictEqual(count(), "2 items left")

  toggle(0)
  assert.strictEqual(count(), "1 item left")
})

test("#apps/todomvc: mark all as complete completes every todo, and clears them", () => {
  const { completed, count, toggleAll } = open({ todos: TODOS })

  toggleAll(true)
  assert.deepStrictEqual(completed(), [true, true])
  assert.strictEqual(count(), "0 items left")

  toggleAll(false)
  assert.deepStrictEqual(completed(), [false, false])
  assert.strictEqual(count(), "2 items left")
})

test("#apps/todomvc: mark all as complete follows the todos", () => {
  const { one, toggle, submit } = open({ todos: TODOS })
  const box = () => one("[data-toggle-all]").checked

  assert.strictEqual(box(), false)

  toggle(0)
  assert.strictEqual(box(), true)

  submit("write tests")
  assert.strictEqual(box(), false)
})

test("#apps/todomvc: an empty app does not claim everything is done", () => {
  const { one } = open({ todos: [] })

  assert.strictEqual(one("[data-toggle-all]").checked, false)
})

test("#apps/todomvc: clear completed removes the completed todos", () => {
  const { titles, count, clear } = open({ todos: TODOS })

  clear()

  assert.deepStrictEqual(titles(), ["buy milk"])
  assert.strictEqual(count(), "1 item left")
})

/*
 * "Make sure to clear the checked state after the Clear completed button is
 * clicked."
 */
test("#apps/todomvc: clear completed unchecks mark all as complete", () => {
  const { one, toggleAll, submit, clear } = open({ todos: TODOS })

  toggleAll(true)
  assert.strictEqual(one("[data-toggle-all]").checked, true)

  clear()
  submit("write tests")
  assert.strictEqual(one("[data-toggle-all]").checked, false)
})

test("#apps/todomvc: clear completed is hidden while nothing is completed", () => {
  const { visible, toggle, clear } = open({ todos: [todo(1, "buy milk")] })

  assert.strictEqual(visible("[data-clear-completed]"), false)

  toggle(0)
  assert.strictEqual(visible("[data-clear-completed]"), true)

  clear()
  assert.strictEqual(visible("[data-clear-completed]"), false)
})
