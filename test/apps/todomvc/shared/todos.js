/*
 * The list, and nothing else: no DOM, no storage, no browser.
 *
 * This file is required by the server components and imported by the client
 * script, so the rule for what "active" means, or which todos a filter shows,
 * is written down once. Boxwood bundles a client entry from its own files and
 * understands CommonJS, so the same module works on both sides - the only
 * thing it may not do is reach for anything that exists on one side only.
 *
 * Every function takes a list and returns a new one. Nothing here mutates,
 * which is what lets the controller keep a single place where state changes.
 */

const ALL = "all"
const ACTIVE = "active"
const COMPLETED = "completed"

const FILTERS = [ALL, ACTIVE, COMPLETED]

function active(todos) {
  return todos.filter((todo) => !todo.completed)
}

function completed(todos) {
  return todos.filter((todo) => todo.completed)
}

function filtered(todos, filter) {
  if (filter === ACTIVE) return active(todos)
  if (filter === COMPLETED) return completed(todos)
  return todos
}

// "0 items left", "1 item left", "2 items left".
function remaining(todos) {
  const count = active(todos).length
  return { count, label: count === 1 ? "item left" : "items left" }
}

function add(todos, title) {
  // Derived from the list rather than from a counter, so a list restored from
  // storage cannot hand out an id it is already using.
  const id = todos.reduce((max, todo) => Math.max(max, todo.id), 0) + 1
  return todos.concat({ id, title, completed: false })
}

function remove(todos, id) {
  return todos.filter((todo) => todo.id !== id)
}

function toggle(todos, id) {
  return todos.map((todo) =>
    todo.id === id
      ? { id: todo.id, title: todo.title, completed: !todo.completed }
      : todo,
  )
}

function rename(todos, id, title) {
  return todos.map((todo) =>
    todo.id === id ? { id: todo.id, title, completed: todo.completed } : todo,
  )
}

function toggleAll(todos, value) {
  return todos.map((todo) => ({
    id: todo.id,
    title: todo.title,
    completed: value,
  }))
}

function clearCompleted(todos) {
  return active(todos)
}

// Whether the "mark all as complete" box is checked: every todo done, and
// there is at least one.
function allCompleted(todos) {
  return todos.length > 0 && active(todos).length === 0
}

module.exports = {
  ALL,
  ACTIVE,
  COMPLETED,
  FILTERS,
  active,
  completed,
  filtered,
  remaining,
  add,
  remove,
  toggle,
  rename,
  toggleAll,
  clearCompleted,
  allCompleted,
}
