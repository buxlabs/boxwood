import { div, State } from 'boxwood'

export default function accordion () {
  const state = new State({ show: false })
  return [
    div({ class: "accordion-toggle", onclick: () => state.toggle('show') }),
    div({ class: "accordion", style: { display: state.get('show') ? 'block': 'none' } })
  ]
}
