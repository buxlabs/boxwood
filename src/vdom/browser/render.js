'use strict'

const css = require('../utilities/css')
const escape = require('../utilities/escape')

function render (node, state, dispatch) {
  if (typeof node === 'string') {
    return renderText(node)
  } else if (typeof node === 'number') {
    return renderNumber(node)
  } else if (node.name === '!DOCTYPE') {
    return renderDoctype()
  } else if (Array.isArray(node)) {
    const nodes = node.map(tag => render(tag, state, dispatch))
    const fragment = document.createDocumentFragment()
    nodes.forEach(element => fragment.appendChild(element))
    return fragment
  }
  return renderElement(node, state, dispatch)
}

function renderText (text) {
  return document.createTextNode(escape(text))
}

function renderNumber (number) {
  return document.createTextNode(number)
}

function renderDoctype (node) {
  return document.createDocumentFragment()
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
    } else if (key === 'style') {
      element.setAttribute(key, css(value))
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
