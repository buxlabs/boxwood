const { Button, Input, Label, Li } = require("../../../..")

/*
 * One row of the list.
 *
 * This markup exists twice: here, and in client/views/item.js, which builds
 * the same element in the browser for items added after load. That is the
 * seam where a template library and a reactive one stop agreeing, so it is
 * pinned down rather than trusted - nothing here carries a scoped class name,
 * which lets rendering.test.js compare the two outright.
 */
module.exports = ({ todo, editing = false }) => {
  const attributes = { "data-item": "", "data-id": String(todo.id) }
  if (todo.completed) {
    attributes["data-completed"] = ""
  }
  if (editing) {
    attributes["data-editing"] = ""
  }
  return Li(attributes, [
    Input({
      type: "checkbox",
      "data-action": "toggle",
      checked: todo.completed,
    }),
    Label({ "data-title": "" }, todo.title),
    Button(
      {
        type: "button",
        "data-action": "destroy",
        "aria-label": `Delete ${todo.title}`,
      },
      "×",
    ),
    Input({
      type: "text",
      "data-edit": "",
      value: todo.title,
      autocomplete: "off",
    }),
  ])
}
