const { H1, H2, Ul, Li } = require("../..")

module.exports = function ({ title, subtitle, todos }) {
  return [
    H1(title),
    H2(subtitle),
    Ul(todos.map((todo) => Li(todo.description))),
  ]
}
