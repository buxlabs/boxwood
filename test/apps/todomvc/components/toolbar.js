const { A, Button, Footer, Li, Span, Strong, Ul } = require("../../../..")
const todos = require("../shared/todos")
const styles = require("../styles")

const HREFS = { all: "#/", active: "#/active", completed: "#/completed" }
const LABELS = { all: "All", active: "Active", completed: "Completed" }

/*
 * The count is rendered as <strong>2</strong> plus a text node, which is what
 * the client rebuilds it as - the two have to agree, because the server draws
 * it first and the browser draws it from then on.
 */
module.exports = ({ list, filter }) => {
  const attributes = { class: styles.footer, "data-footer": "" }
  if (list.length === 0) {
    attributes["data-hidden"] = ""
  }
  const { count, label } = todos.remaining(list)
  const clear = {
    type: "button",
    class: styles.clear,
    "data-clear-completed": "",
  }
  if (todos.completed(list).length === 0) {
    clear["data-hidden"] = ""
  }
  return Footer(attributes, [
    Span({ class: styles.count, "data-count": "" }, [
      Strong(String(count)),
      ` ${label}`,
    ]),
    Ul(
      { class: styles.filters },
      todos.FILTERS.map((name) => {
        const link = { href: HREFS[name], "data-filter": name }
        if (name === filter) {
          link["data-selected"] = ""
        }
        return Li([A(link, LABELS[name])])
      }),
    ),
    Button(clear, "Clear completed"),
  ])
}
