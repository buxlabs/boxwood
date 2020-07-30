'use strict'

const { OBJECT_VARIABLE } = require('../utilities/enum')
const { getTemplateAssignmentExpression } = require('../utilities/factory')
const walk = require('himalaya-walk')

module.exports = function translation ({ tree, fragment, attrs, options }) {
  const attr = attrs[0]
  const language = attr.key
  fragment.used = true
  walk(fragment.children, node => {
    node.used = true
  })
  const text = fragment.children[0]
  if (text && language) {
    const statement = {
      type: 'IfStatement',
      test: {
        type: 'BinaryExpression',
        left: {
          type: 'MemberExpression',
          object: {
            type: 'Identifier',
            name: OBJECT_VARIABLE
          },
          property: { type: 'Identifier', name: 'language' }
        },
        right: { type: 'Literal', value: language },
        operator: '==='
      },
      consequent: {
        type: 'BlockStatement',
        body: [
          getTemplateAssignmentExpression(options.variables.template, { type: 'Literal', value: text.content })
        ]
      },
      alternate: null
    }
    tree.append(statement)
  }
}
