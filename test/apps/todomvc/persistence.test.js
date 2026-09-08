const test = require("node:test")
const assert = require("node:assert")
const { KEY, open, todo } = require("./helpers")

const TODOS = [todo(1, "buy milk"), todo(2, "walk dog", true)]

test("#apps/todomvc: the key is todos-[framework]", () => {
  assert.strictEqual(KEY, "todos-boxwood")
})

test("#apps/todomvc: a todo is stored under id, title and completed", () => {
  const { stored, submit } = open({ todos: [] })

  submit("write tests")

  assert.deepStrictEqual(stored(), [
    { id: 1, title: "write tests", completed: false },
  ])
})

test("#apps/todomvc: every change is written through", () => {
  const { stored, submit, toggle, destroy } = open({ todos: [] })

  submit("one")
  submit("two")
  assert.deepStrictEqual(
    stored().map((item) => item.title),
    ["one", "two"],
  )

  toggle(0)
  assert.deepStrictEqual(
    stored().map((item) => item.completed),
    [true, false],
  )

  destroy(0)
  assert.deepStrictEqual(
    stored().map((item) => item.title),
    ["two"],
  )
})

test("#apps/todomvc: what was stored is what comes back", () => {
  const { titles, completed, count } = open({ todos: [], stored: TODOS })

  assert.deepStrictEqual(titles(), ["buy milk", "walk dog"])
  assert.deepStrictEqual(completed(), [false, true])
  assert.strictEqual(count(), "1 item left")
})

/*
 * The page arrives with whatever the server knew. Storage, when there is any,
 * is what the person actually left behind, and wins.
 */
test("#apps/todomvc: storage wins over what the server rendered", () => {
  const { titles } = open({ todos: TODOS, stored: [todo(9, "write tests")] })

  assert.deepStrictEqual(titles(), ["write tests"])
})

test("#apps/todomvc: a first visit keeps what the server rendered", () => {
  const { titles, stored } = open({ todos: TODOS })

  assert.deepStrictEqual(titles(), ["buy milk", "walk dog"])
  // Nothing is written until something changes.
  assert.strictEqual(stored(), null)
})

test("#apps/todomvc: an id is never handed out twice", () => {
  const { stored, submit } = open({ todos: [], stored: [todo(7, "buy milk")] })

  submit("write tests")

  assert.deepStrictEqual(
    stored().map((item) => item.id),
    [7, 8],
  )
})

test("#apps/todomvc: editing is not persisted", () => {
  const { stored, editor, edit, key } = open({ todos: [], stored: TODOS })

  edit(0)
  editor().value = "buy oat milk"
  key("Enter")

  assert.deepStrictEqual(stored(), [
    { id: 1, title: "buy oat milk", completed: false },
    { id: 2, title: "walk dog", completed: true },
  ])
  for (const item of stored()) {
    assert.deepStrictEqual(Object.keys(item), ["id", "title", "completed"])
  }
})

/*
 * Storage is shared with everything else on the origin and outlives any one
 * version of this app, so what comes out of it is not to be trusted.
 */
test("#apps/todomvc: an unreadable store falls back to the server's list", () => {
  const unreadable = ["{ not json", '"a string"', "42", "null"]

  for (const value of unreadable) {
    const { titles } = open({ todos: TODOS, stored: value })
    assert.deepStrictEqual(titles(), ["buy milk", "walk dog"], value)
  }
})

test("#apps/todomvc: entries that are not todos are dropped", () => {
  const { titles } = open({
    todos: [],
    stored: JSON.stringify([
      { id: 1, title: "buy milk", completed: false },
      { id: "2", title: "walk dog", completed: true },
      { title: "no id" },
      null,
      "write tests",
    ]),
  })

  assert.deepStrictEqual(titles(), ["buy milk"])
})

test("#apps/todomvc: an empty store is an empty app, not the server's list", () => {
  const { titles, visible } = open({ todos: TODOS, stored: [] })

  assert.deepStrictEqual(titles(), [])
  assert.strictEqual(visible("[data-main]"), false)
})
