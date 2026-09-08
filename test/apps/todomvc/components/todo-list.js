const { Input, Label, Section, Ul } = require("../../../..")
const todos = require("../shared/todos")
const styles = require("../styles")
const TodoItem = require("./todo-item")

/*
 * The list, and the box that marks every item at once. Hidden along with the
 * toolbar when there is nothing to show, which the spec asks for and which
 * also keeps an empty app from rendering an empty grey bar.
 */
module.exports = ({ list, filter }) => {
  // No class of its own: this section is a hook, not something to style.
  const attributes = { "data-main": "" }
  if (list.length === 0) {
    attributes["data-hidden"] = ""
  }
  return Section(attributes, [
    Label({ class: styles.toggles }, [
      Input({
        type: "checkbox",
        "data-toggle-all": "",
        checked: todos.allCompleted(list),
      }),
      "Mark all as complete",
    ]),
    Ul(
      { class: styles.list, "data-todos": "" },
      todos.filtered(list, filter).map((todo) => TodoItem({ todo })),
    ),
  ])
}
