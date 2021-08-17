import { div, html, doctype, head, body, title, style } from 'boxwood'
import styles from './example.css?scoped=true'

export default function App () {
  return [
    doctype(),
    html([
      head([
        title("foo"),
        style({ scoped: true })
      ]),
      body([
        div({ class: styles.container }, 'foo')
      ])
    ])
  ]
}
