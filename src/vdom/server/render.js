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
  const element = { name, attributes: [], children: '' }

  for (const key in attributes) {
    const value = attributes[key]
    element.attributes.push(`${key}="${value}"`)
  }

  for (let i = 0, ilen = children.length; i < ilen; i++) {
    const child = children[i]
    element.children += render(child, state, dispatch)
  }

  if (element.attributes.length > 0) {
    if (SELF_CLOSING_TAGS.includes(element.name)) {
      return `<${element.name} ${element.attributes.join(' ')}/>`
    }
    return `<${element.name} ${element.attributes.join(' ')}>${element.children}</${element.name}>`
  }
  if (SELF_CLOSING_TAGS.includes(element.name)) {
    return `<${element.name}/>`
  }
  return `<${element.name}>${element.children}</${element.name}>`
}

module.exports = render
