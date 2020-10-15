import { tag, State } from 'boxwood'

export default function App () {
  const state = new State({ count: 0 })

  return tag('html', [
    tag('head', [
      tag('title', 'Counter App')
    ]),
    tag('body', [
      tag('button', {
        onclick: () => state.count += 1
      }, [`Clicked ${state.count} ${state.count === 1 ? 'time' : 'times'}`])
    ])
  ])
}
