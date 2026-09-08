const { Button, Form, H1, Header, Input } = require("../../../..")
const styles = require("../styles")

/*
 * A form rather than a bare input with a keydown handler: Enter submits for
 * free, so there is no key to name, and the field is a field rather than a
 * text box that happens to react to one.
 */
module.exports = () =>
  Header([
    H1({ class: styles.title }, "todos"),
    Form({ "data-new-todo-form": "" }, [
      Input({
        class: styles.new,
        "data-new-todo": "",
        name: "title",
        placeholder: "What needs to be done?",
        "aria-label": "What needs to be done?",
        autofocus: true,
        autocomplete: "off",
      }),
      Button({ type: "submit", class: styles.offscreen }, "Add"),
    ]),
  ])
