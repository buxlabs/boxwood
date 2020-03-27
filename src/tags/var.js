'use strict'

const AbstractSyntaxTree = require('abstract-syntax-tree')
const { isCurlyTag, getTagValue } = require('../utilities/string')

const getExpression = (value) => {
  if (isCurlyTag(value)) {
    const source = getTagValue(value)
    const tree = new AbstractSyntaxTree(`(${source})`)
    const { expression } = tree.body[0]
    return expression
  } else {
    return { type: 'Literal', value }
  }
}

module.exports = function ({ tree, attrs, variables }) {
  const attribute = attrs[0]
  const { key, value } = attribute
  variables.push(key)
  tree.append({
    type: 'VariableDeclaration',
    declarations: [
      {
        type: 'VariableDeclarator',
        init: getExpression(value),
        id: { type: 'Identifier', name: key }
      }
    ],
    kind: 'var'
  })
}
