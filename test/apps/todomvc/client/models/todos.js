/*
 * Storage. The list itself is shared/todos.js, which knows nothing about the
 * browser; this is the part that only makes sense in one.
 */

const KEY = "todos-boxwood"

function isTodo(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof value.id === "number" &&
    typeof value.title === "string" &&
    typeof value.completed === "boolean"
  )
}

/*
 * Storage can be missing, denied, or hold something that is not a list of
 * todos any more - a half written value, an older format, an edited one. None
 * of that is worth a blank page, so anything unreadable falls back to what
 * the server rendered.
 */
export function load(fallback) {
  let stored
  try {
    stored = window.localStorage.getItem(KEY)
  } catch (error) {
    return fallback
  }
  if (stored === null) return fallback
  try {
    const parsed = JSON.parse(stored)
    if (!Array.isArray(parsed)) return fallback
    return parsed.filter(isTodo)
  } catch (error) {
    return fallback
  }
}

export function save(todos) {
  try {
    // Written out key by key, which is what keeps editing from being
    // persisted: the state the controller carries is not part of a todo.
    window.localStorage.setItem(
      KEY,
      JSON.stringify(
        todos.map((todo) => ({
          id: todo.id,
          title: todo.title,
          completed: todo.completed,
        })),
      ),
    )
  } catch (error) {
    // A full quota, or a browser refusing to store anything at all. The
    // change is already on screen; losing it as well would help nobody.
  }
}
