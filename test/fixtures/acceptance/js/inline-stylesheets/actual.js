import { div, link, style } from "boxwood"

export default function app () {
  return [
    div({ class: "foo" }),
    link({ src: "/style/main.css", inline: true }),
    style({ scoped: true })
  ]
}
