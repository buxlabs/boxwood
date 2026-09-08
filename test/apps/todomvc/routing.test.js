const test = require("node:test")
const assert = require("node:assert")
const { open, todo } = require("./helpers")

const TODOS = [todo(1, "buy milk"), todo(2, "walk dog", true)]

test("#apps/todomvc: the default route shows everything", () => {
  const { titles, selected } = open({ todos: TODOS })

  assert.deepStrictEqual(titles(), ["buy milk", "walk dog"])
  assert.deepStrictEqual(selected(), ["all"])
})

test("#apps/todomvc: #/active shows the todos that are left", async () => {
  const { titles, selected, navigate } = open({ todos: TODOS })

  await navigate("#/active")

  assert.deepStrictEqual(titles(), ["buy milk"])
  assert.deepStrictEqual(selected(), ["active"])
})

test("#apps/todomvc: #/completed shows the todos that are done", async () => {
  const { titles, selected, navigate } = open({ todos: TODOS })

  await navigate("#/completed")

  assert.deepStrictEqual(titles(), ["walk dog"])
  assert.deepStrictEqual(selected(), ["completed"])
})

test("#apps/todomvc: going back to #/ shows everything again", async () => {
  const { titles, navigate } = open({ todos: TODOS })

  await navigate("#/completed")
  await navigate("#/")

  assert.deepStrictEqual(titles(), ["buy milk", "walk dog"])
})

test("#apps/todomvc: a route nobody implemented is the default one", () => {
  const { titles, selected } = open({ todos: TODOS, hash: "#/nonsense" })

  assert.deepStrictEqual(titles(), ["buy milk", "walk dog"])
  assert.deepStrictEqual(selected(), ["all"])
})

/*
 * "Make sure the active filter is persisted on reload." It is in the address
 * bar, so a reload is a load with the fragment already set - which is what
 * this is.
 */
test("#apps/todomvc: the filter survives a reload", () => {
  const { titles, selected } = open({ todos: TODOS, hash: "#/active" })

  assert.deepStrictEqual(titles(), ["buy milk"])
  assert.deepStrictEqual(selected(), ["active"])
})

/*
 * "If the filter is Active and the item is checked, it should be hidden."
 */
test("#apps/todomvc: completing a todo while filtered to active hides it", async () => {
  const { titles, count, toggle, navigate } = open({ todos: TODOS })

  await navigate("#/active")
  assert.deepStrictEqual(titles(), ["buy milk"])

  toggle(0)

  assert.deepStrictEqual(titles(), [])
  // Filtered out, not gone.
  assert.strictEqual(count(), "0 items left")
})

test("#apps/todomvc: a todo added while filtered to completed is still added", async () => {
  const { titles, count, submit, navigate } = open({ todos: TODOS })

  await navigate("#/completed")
  submit("write tests")

  assert.deepStrictEqual(titles(), ["walk dog"])
  assert.strictEqual(count(), "2 items left")

  await navigate("#/")
  assert.deepStrictEqual(titles(), ["buy milk", "walk dog", "write tests"])
})

test("#apps/todomvc: the count is of every todo, not the shown ones", async () => {
  const { count, navigate } = open({ todos: TODOS })

  await navigate("#/completed")

  assert.strictEqual(count(), "1 item left")
})

test("#apps/todomvc: the toolbar stays visible while a filter shows nothing", async () => {
  const { visible, titles, navigate } = open({ todos: [todo(1, "buy milk")] })

  await navigate("#/completed")

  assert.deepStrictEqual(titles(), [])
  assert.strictEqual(visible("[data-footer]"), true)
})
