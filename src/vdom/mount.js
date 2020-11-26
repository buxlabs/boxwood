'use strict'

function replaceElement (target, node) {
  return target.replaceWith(node)
}

function mount (node, target) {
  replaceElement(target, node)
  return node
}

module.exports = mount
