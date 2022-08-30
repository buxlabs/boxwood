const { h1, h2, ul, li } = require('../../../..')

module.exports = function ({ title, subtitle, todos }) {
  return [
    h1(title),
    h2(subtitle),
    ul(todos.map(todo => li(todo.description)))
  ].join('')
}
