'use strict'

const { IfStatement, BinaryExpression, MemberExpression, Identifier, Literal, BlockStatement } = require('abstract-syntax-tree')
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
  const leaf = fragment.children[0]
  if (language && leaf) {
    const statement = new IfStatement({
      test: new BinaryExpression({
        left: new MemberExpression({
          object: new Identifier({ name: OBJECT_VARIABLE }),
          property: new Identifier({ name: 'language' })
        }),
        right: new Literal({ value: language }),
        operator: '==='
      }),
      consequent: new BlockStatement({
        body: [
          getTemplateAssignmentExpression(options.variables.template, new Literal({ value: leaf.content }))
        ]
      })
    })
    tree.append(statement)
  }
}
