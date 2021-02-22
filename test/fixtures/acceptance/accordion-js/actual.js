import { doctype, html, head, title, body } from 'boxwood'
import accordion from 'components/accordion'

export default function app () {
  return [
    doctype(),
    html([
      head([
        title('foo')
      ]),
      body([
        accordion()
      ])
    ])
  ]
}
