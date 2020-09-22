'use strict'

const { match } = require('abstract-syntax-tree')
const { OBJECT_VARIABLE } = require('./enum')

function getScopeProperties (tree) {
  const properties = []
  tree.walk(node => {
    if (match(node, 'MemberExpression[object.type="Identifier"][object.name="scope"]')) {
      const property = getPropertyNode(node)
      properties.push(property)
    } else if (match(node, 'VariableDeclarator[init.name="scope"]')) {
      node.id.properties.forEach(leaf => {
        const property = getPropertyNode(leaf)
        properties.push(property)
      })
    }
  })
  return properties
}

function getPropertyNode (node) {
  return {
    type: 'Property',
    method: false,
    shorthand: false,
    computed: false,
    key: node.property || node.key,
    value: {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: OBJECT_VARIABLE
      },
      property: node.property || node.key,
      computed: false
    },
    kind: 'init'
  }
}

module.exports = {
  getScopeProperties
}
