import { h1, h2, ul, li } from 'boxwood'

export default function ({ title, subtitle, todos }) {
  return [
    h1(title),
    h2(subtitle),
    ul(todos.map(todo => li(todo.description)))
  ]
}
