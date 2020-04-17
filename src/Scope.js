const { replace } = require('abstract-syntax-tree')
const { OBJECT_VARIABLE } = require('./utilities/enum')
const { isGlobalVariable } = require('./utilities/globals')

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
