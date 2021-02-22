import { div } from 'boxwood'

export default function accordion () {
  return [
    div({ class: "accordion-toggle" }),
    div({ class: "accordion" })
  ]
}
