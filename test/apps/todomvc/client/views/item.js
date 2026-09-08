/*
 * The browser's half of an item's markup. Its opposite number is
 * components/todo-item.js, and the two are compared in rendering.test.js -
 * an item added in the browser has to be indistinguishable from one the
 * server drew, or the stylesheet and the next reload will disagree with the
 * screen.
 */

export function create(todo, editing) {
  const element = document.createElement("li")
  element.setAttribute("data-item", "")
  element.setAttribute("data-id", String(todo.id))
  if (todo.completed) {
    element.setAttribute("data-completed", "")
  }
  if (editing) {
    element.setAttribute("data-editing", "")
  }

  const toggle = document.createElement("input")
  toggle.setAttribute("type", "checkbox")
  toggle.setAttribute("data-action", "toggle")
  if (todo.completed) {
    toggle.setAttribute("checked", "")
  }

  const title = document.createElement("label")
  title.setAttribute("data-title", "")
  // textContent, never innerHTML: a title is text and is never read as markup.
  title.textContent = todo.title

  const destroy = document.createElement("button")
  destroy.setAttribute("type", "button")
  destroy.setAttribute("data-action", "destroy")
  destroy.setAttribute("aria-label", "Delete " + todo.title)
  destroy.textContent = "×"

  const edit = document.createElement("input")
  edit.setAttribute("type", "text")
  edit.setAttribute("data-edit", "")
  // The attribute rather than the property, so the element serialises the
  // way the server writes it.
  edit.setAttribute("value", todo.title)
  edit.setAttribute("autocomplete", "off")

  element.append(toggle, title, destroy, edit)
  return element
}

/*
 * The other direction: what the server rendered, read back as todos. Used
 * once, on load, when the browser has nothing stored yet - so a first visit
 * keeps whatever the page arrived with instead of blanking it.
 */
export function read(element) {
  return {
    id: Number(element.getAttribute("data-id")),
    title: element.querySelector("[data-title]").textContent,
    completed: element.hasAttribute("data-completed"),
  }
}
