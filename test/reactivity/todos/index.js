const { join } = require("path")
const {
  component,
  css,
  js,
  Body,
  Button,
  Form,
  H1,
  Head,
  Html,
  Input,
  Li,
  P,
  Span,
  Title,
  Ul,
} = require("../../..")

const styles = css.load(__dirname)

/*
 * A list is where a template library and a reactive one stop agreeing. The
 * initial items are rendered on the server, everything after that is built by
 * hand in the browser - so the markup of a single item exists twice, once here
 * and once as a string in the script below. Keeping those two in sync is the
 * job a list feature would take over.
 *
 * Clicks are delegated to the list, because items added later were never
 * around when listeners were attached.
 */
module.exports = component(
  ({ todos }) => {
    return Html([
      Head([Title("Todos")]),
      Body([
        H1("Todos"),
        Form({ "data-new-todo-form": "" }, [
          Input({
            "data-new-todo": "",
            name: "description",
            autocomplete: "off",
          }),
          Button({ type: "submit" }, "Add"),
        ]),
        Ul(
          { class: styles.list, "data-todos": "" },
          todos.map((todo) =>
            Li(
              todo.done
                ? { "data-item": "", "data-done": "" }
                : { "data-item": "" },
              [
                Input({
                  type: "checkbox",
                  "data-action": "toggle",
                  checked: todo.done,
                }),
                Span(todo.description),
                Button({ type: "button", "data-action": "remove" }, "Remove"),
              ],
            ),
          ),
        ),
        P(
          todos.length
            ? { class: styles.empty, "data-empty": "", "data-hidden": "" }
            : { class: styles.empty, "data-empty": "" },
          "Nothing to do.",
        ),
        // Rendered on the server too, so there is no flash of an empty count.
        // The client recomputes the same value on load.
        Span(
          { class: styles.remaining, "data-remaining": "" },
          `${todos.filter((todo) => !todo.done).length} remaining`,
        ),
      ]),
    ])
  },
  {
    styles,
    scripts: [js.load(join(__dirname, "client.js"))],
  },
)
