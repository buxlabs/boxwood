import { doctype, html, head, title, body } from "boxwood"

export default function layout (children) {
  return [
    doctype(),
    html([
      head([
        title("Landing page")
      ]),
      body(children)
    ])
  ]
}
