'use strict'

const { SELF_CLOSING_TAGS } = require('../../utilities/enum')

function render (node, state, dispatch) {
  if (typeof node === 'string') {
    return node
  }
  return renderElement(node, state, dispatch)
}

function renderElement (node, state, dispatch) {
  const { name, attributes, children } = node
  const element = { attributes: [], children: '' }

  for (const key in attributes) {
    const value = attributes[key]
    element.attributes.push(`${key}="${value}"`)
  }

  for (let i = 0, ilen = children.length; i < ilen; i++) {
    const child = children[i]
    element.children += render(child, state, dispatch)
  }

  const attrs = element.attributes.length > 0 ? ` ${element.attributes.join(' ')}` : ''
  if (SELF_CLOSING_TAGS.includes(name)) {
    return `<${name}${attrs}/>`
  }
  return `<${name}${attrs}>${element.children}</${name}>`
}

module.exports = render
