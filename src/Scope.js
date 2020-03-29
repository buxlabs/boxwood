const { replace } = require('abstract-syntax-tree')
const { GLOBAL_VARIABLE, OBJECT_VARIABLE } = require('./utilities/enum')

function isMemberExpression (node) {
  return node.type === 'MemberExpression'
}

function isIdentifier (node, name) {
  return node.type === 'Identifier' && node.name === name
}

function isGlobalVariable (node) {
  return isMemberExpression(node) &&
    isMemberExpression(node.object) &&
    isIdentifier(node.object.object, OBJECT_VARIABLE) &&
    isIdentifier(node.object.property, GLOBAL_VARIABLE)
}

class Scope {
  flatten (tree) {
    replace(tree, node => {
      if (isGlobalVariable(node)) {
        return {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: OBJECT_VARIABLE },
          property: node.property,
          computed: node.computed
        }
      }
    })
  }
}

module.exports = Scope
