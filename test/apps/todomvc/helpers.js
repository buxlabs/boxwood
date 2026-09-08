const { JSDOM } = require("jsdom")
const { compile } = require("../../..")

const KEY = "todos-boxwood"
const ORIGIN = "https://todomvc.test/"

const todo = (id, title, completed = false) => ({ id, title, completed })

function markup({ todos = [], filter = "all" } = {}) {
  const { template } = compile(__dirname)
  return template({ todos, filter })
}

function script(document) {
  const scripts = document.querySelectorAll("script")
  if (scripts.length !== 1) {
    throw new Error(
      `expected exactly one inline script, found ${scripts.length}`,
    )
  }
  return scripts[0].textContent
}

/*
 * The page, with the bundle run by hand rather than by the parser.
 *
 * Two of the things worth testing - what the browser had stored, and which
 * filter the address bar asked for - are true before the script runs, and
 * "dangerously" would have run it during parsing, before a test could say so.
 */
function open({ todos = [], filter = "all", hash = "#/", stored } = {}) {
  const dom = new JSDOM(markup({ todos, filter }), {
    url: ORIGIN + hash,
    runScripts: "outside-only",
  })
  if (stored !== undefined) {
    dom.window.localStorage.setItem(
      KEY,
      typeof stored === "string" ? stored : JSON.stringify(stored),
    )
  }
  dom.window.eval(script(dom.window.document))
  return app(dom)
}

function app(dom) {
  const { window } = dom
  const { document } = window

  const one = (selector) => document.querySelector(selector)
  const all = (selector) => Array.from(document.querySelectorAll(selector))

  const items = () => all("[data-item]")
  const titles = () =>
    items().map((item) => item.querySelector("[data-title]").textContent)
  const completed = () =>
    items().map((item) => item.hasAttribute("data-completed"))

  // The generated class names are not the point; whether the cascade ends up
  // showing the element is. jsdom resolves the inlined stylesheet for us.
  const visible = (selector) =>
    window.getComputedStyle(one(selector)).display !== "none"

  const count = () => one("[data-count]").textContent
  const selected = () =>
    all("[data-filter]")
      .filter((link) => link.hasAttribute("data-selected"))
      .map((link) => link.getAttribute("data-filter"))

  const item = (index) => {
    const element = items()[index]
    if (!element) throw new Error(`there is no item ${index}`)
    return element
  }

  const dispatch = (element, event) => element.dispatchEvent(event)

  function submit(title) {
    one("[data-new-todo]").value = title
    dispatch(
      one("[data-new-todo-form]"),
      new window.Event("submit", { bubbles: true, cancelable: true }),
    )
  }

  function toggle(index) {
    const checkbox = item(index).querySelector("[data-action=toggle]")
    checkbox.checked = !checkbox.checked
    dispatch(checkbox, new window.Event("change", { bubbles: true }))
  }

  function destroy(index) {
    dispatch(
      item(index).querySelector("[data-action=destroy]"),
      new window.MouseEvent("click", { bubbles: true }),
    )
  }

  function toggleAll(value) {
    const checkbox = one("[data-toggle-all]")
    checkbox.checked = value === undefined ? !checkbox.checked : value
    dispatch(checkbox, new window.Event("change", { bubbles: true }))
  }

  function clear() {
    dispatch(
      one("[data-clear-completed]"),
      new window.MouseEvent("click", { bubbles: true }),
    )
  }

  function edit(index) {
    dispatch(
      item(index).querySelector("[data-title]"),
      new window.MouseEvent("dblclick", { bubbles: true }),
    )
  }

  const editor = () => one("[data-editing] [data-edit]")

  function key(name) {
    dispatch(
      editor(),
      new window.KeyboardEvent("keydown", { key: name, bubbles: true }),
    )
  }

  // A real blur, so the capturing listener hears the same event a browser
  // would send it.
  const blur = () => editor().blur()

  // A blur on some other row's field. Hidden while another row is being
  // edited, but present, focusable and one stray click away.
  function blurField(index) {
    dispatch(
      item(index).querySelector("[data-edit]"),
      new window.FocusEvent("blur"),
    )
  }

  async function navigate(hash) {
    window.location.hash = hash
    // hashchange is queued rather than dispatched inline.
    await new Promise((resolve) => setTimeout(resolve, 0))
  }

  const stored = () => {
    const value = window.localStorage.getItem(KEY)
    return value === null ? null : JSON.parse(value)
  }

  return {
    dom,
    window,
    document,
    one,
    all,
    items,
    titles,
    completed,
    visible,
    count,
    selected,
    item,
    editor,
    stored,
    submit,
    toggle,
    destroy,
    toggleAll,
    clear,
    edit,
    key,
    blur,
    blurField,
    navigate,
  }
}

module.exports = { KEY, ORIGIN, todo, markup, script, open }
