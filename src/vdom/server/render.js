'use strict'

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

  if (element.attributes) {
    return `<${element.name} ${element.attributes.join(' ')}>${element.children}</${element.name}>`
  }
  return `<${element.name}>${element.children}</${element.name}>`
}

module.exports = render
