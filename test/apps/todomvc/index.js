const { join } = require("path")
const {
  component,
  js,
  Body,
  Doctype,
  Head,
  Html,
  Meta,
  Section,
  Title,
} = require("../../..")
const todos = require("./shared/todos")
const styles = require("./styles")
const NewTodo = require("./components/new-todo")
const TodoList = require("./components/todo-list")
const Toolbar = require("./components/toolbar")
const Credits = require("./components/credits")

/*
 * TodoMVC, server rendered.
 *
 * The list lives in the browser - the spec asks for localStorage - so what
 * the server draws is whatever it was handed: an empty list from the preview
 * server, a real one from a test. That render is not wasted work. It is what
 * a crawler and a reader without JavaScript get, and it is the markup the
 * client is measured against.
 *
 * The filter is a fragment, which a server never sees, so a page rendered
 * over HTTP always says "all" and the client corrects it on load. The prop is
 * here for a server that knows better - and for tests, which do.
 */
module.exports = component(
  ({ todos: list = [], filter = todos.ALL } = {}) => [
    Doctype(),
    Html({ lang: "en" }, [
      Head([
        Meta({ charset: "utf-8" }),
        Meta({
          name: "viewport",
          content: "width=device-width, initial-scale=1",
        }),
        Title("boxwood • TodoMVC"),
      ]),
      Body([
        Section({ class: styles.app, "data-app": "" }, [
          NewTodo(),
          TodoList({ list, filter }),
          Toolbar({ list, filter }),
        ]),
        Credits(),
      ]),
    ]),
  ],
  {
    styles,
    scripts: [js.load(join(__dirname, "client"))],
  },
)
