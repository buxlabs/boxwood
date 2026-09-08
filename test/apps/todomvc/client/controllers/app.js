import {
  ACTIVE,
  ALL,
  COMPLETED,
  add,
  allCompleted,
  clearCompleted,
  completed,
  filtered,
  remaining,
  remove,
  rename,
  toggle,
  toggleAll,
} from "../../shared/todos"
import { load, save } from "../models/todos"
import { create, read } from "../views/item"

const ROUTES = { "#/active": ACTIVE, "#/completed": COMPLETED }

function route() {
  return ROUTES[window.location.hash] || ALL
}

export function start(root) {
  /*
   * A property, not an attribute. An attribute survives a markup swap while
   * the listeners on the old elements do not, so a component that guarded
   * itself with one would come back from a soft navigation permanently dead.
   */
  if (root.ready) return
  root.ready = true

  const form = root.querySelector("[data-new-todo-form]")
  const input = root.querySelector("[data-new-todo]")
  const main = root.querySelector("[data-main]")
  const list = root.querySelector("[data-todos]")
  const all = root.querySelector("[data-toggle-all]")
  const footer = root.querySelector("[data-footer]")
  const count = root.querySelector("[data-count]")
  const clear = root.querySelector("[data-clear-completed]")
  const links = root.querySelectorAll("[data-filter]")

  const state = {
    // What was left behind last time, and failing that what the server drew.
    todos: load(
      Array.prototype.map.call(list.querySelectorAll("[data-item]"), read),
    ),
    filter: route(),
    // Which todo is being edited, if any. Deliberately outside the todos, so
    // that it cannot be saved by accident.
    editing: null,
  }

  function commit(todos) {
    state.todos = todos
    save(todos)
    render()
  }

  function render() {
    list.replaceChildren(
      ...filtered(state.todos, state.filter).map((todo) =>
        create(todo, todo.id === state.editing),
      ),
    )

    const { count: left, label } = remaining(state.todos)
    const strong = document.createElement("strong")
    strong.textContent = String(left)
    count.replaceChildren(strong, document.createTextNode(" " + label))

    const empty = state.todos.length === 0
    main.toggleAttribute("data-hidden", empty)
    footer.toggleAttribute("data-hidden", empty)
    clear.toggleAttribute("data-hidden", completed(state.todos).length === 0)
    all.checked = allCompleted(state.todos)
    links.forEach((link) => {
      link.toggleAttribute(
        "data-selected",
        link.getAttribute("data-filter") === state.filter,
      )
    })

    const editor = list.querySelector("[data-editing] [data-edit]")
    if (editor) {
      editor.focus()
      editor.setSelectionRange(editor.value.length, editor.value.length)
    }
  }

  function identify(target) {
    const item = target.closest("[data-item]")
    return item && Number(item.getAttribute("data-id"))
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault()
    const title = input.value.trim()
    if (title === "") return
    commit(add(state.todos, title))
    input.value = ""
  })

  all.addEventListener("change", function (event) {
    commit(toggleAll(state.todos, event.target.checked))
  })

  clear.addEventListener("click", function () {
    commit(clearCompleted(state.todos))
  })

  /*
   * Every listener below is on the list rather than on an item: the list is
   * redrawn on each change, so an item alive when the page loaded is not the
   * one on screen a moment later.
   */
  list.addEventListener("change", function (event) {
    if (event.target.getAttribute("data-action") !== "toggle") return
    commit(toggle(state.todos, identify(event.target)))
  })

  list.addEventListener("click", function (event) {
    if (event.target.getAttribute("data-action") !== "destroy") return
    commit(remove(state.todos, identify(event.target)))
  })

  list.addEventListener("dblclick", function (event) {
    if (!event.target.hasAttribute("data-title")) return
    state.editing = identify(event.target)
    render()
  })

  list.addEventListener("keydown", function (event) {
    if (!event.target.hasAttribute("data-edit")) return
    if (event.key === "Enter") {
      commitEdit(event.target)
    } else if (event.key === "Escape") {
      // Leave the edit without saving it. Cleared first, so the blur that
      // follows the element being taken off the page has nothing left to do.
      state.editing = null
      render()
    }
  })

  list.addEventListener(
    "blur",
    function (event) {
      if (!event.target.hasAttribute("data-edit")) return
      commitEdit(event.target)
    },
    // Blur does not bubble, so the list only hears about it while capturing.
    true,
  )

  function commitEdit(editor) {
    /*
     * The id comes from the field rather than from the state, and the two
     * have to be the same todo. Browsers do not agree on whether removing a
     * focused element fires blur, so this can be reached with a field that
     * has already been taken off the page - once by escape, once by a redraw
     * that happened while the edit was open. Without the check, the second
     * one saved one todo's text onto another.
     */
    const id = identify(editor)
    if (id === null || id !== state.editing) return
    state.editing = null
    const title = editor.value.trim()
    // An emptied todo is a deleted one.
    commit(
      title === "" ? remove(state.todos, id) : rename(state.todos, id, title),
    )
  }

  window.addEventListener("hashchange", function () {
    state.filter = route()
    render()
  })

  render()
}
