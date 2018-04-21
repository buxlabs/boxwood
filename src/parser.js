const { parseFragment } = require('parse5')
const walk = require('./walk')

function getType (node) {
  if (node.nodeName === '#text') return 'text'
  if (node.nodeName === '#comment') return 'comment'
  return 'element'
}

function getAttributes (node) {
  return node.attrs || []
}

function getChildren (node) {
  return node.childNodes || []
}

module.exports = {
  parse (source) {
    const tree = parseFragment(source, { locationInfo: true })
    walk(tree, node => {
      node.type = getType(node)
      node.attributes = getAttributes(node)
      node.children = getChildren(node)
    })
    return tree
  },
  walk (tree, callback) {
    walk(tree, callback)
  }
}
