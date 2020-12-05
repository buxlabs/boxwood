'use strict'

function render (node, state, dispatch) {
  if (typeof node === 'string') {
    return renderText(node)
  }
  return renderElement(node, state, dispatch)
}

function renderText (node) {
  return document.createTextNode(node)
}

function renderElement (node, state, dispatch) {
  const { name, attributes, children } = node
  const element = document.createElement(name)

  for (const key in attributes) {
    const value = attributes[key]
    if (key === 'onclick') {
      // setting event handlers like this is
      // not efficient, e.g. for lists of items
      // it would be better to have one global handler
      element.addEventListener('click', (event) => {
        const newState = value(state, event)
        // dispatch and override state only if it's different
        // than previous state
        state = newState
        dispatch(state)
      })
    } else {
      element.setAttribute(key, value)
    }
  }

  for (let i = 0, ilen = children.length; i < ilen; i++) {
    const child = children[i]
    element.appendChild(render(child, state, dispatch))
  }

  return element
}

module.exports = render