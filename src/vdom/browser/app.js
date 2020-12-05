'use strict'

const mount = require('./mount')
const render = require('./render')
const diff = require('./diff')

function app ({ view, state, root }) {
  let tree = view(state)
  let node = mount(render(tree, state, dispatch), root)

  function dispatch (state) {
    const nextTree = view(state)
    const patch = diff(tree, nextTree, state, dispatch)
    tree = nextTree
    node = patch(node)
  }
}

module.exports = app
