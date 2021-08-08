import { tag, State } from 'boxwood'

function layout (body) {
  return tag('html', [
    tag('head', [
      tag('title', 'Counter App')
    ]),
    tag('body', body)
  ])
}

export default function App () {
  const state = new State({ count: 0 })

  return layout([
    tag('button', {
      onclick: () => state.count++
    }, `Clicked ${state.count} ${state.count === 1 ? 'time' : 'times'}`)
  ])
}
