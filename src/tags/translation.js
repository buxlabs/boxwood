'use strict'

const AbstractSyntaxTree = require('abstract-syntax-tree')
const { OBJECT_VARIABLE } = require('../utilities/enum')
const { createTranslationError } = require('../utilities/errors')

const { IfStatement, BinaryExpression, MemberExpression, Identifier, Literal, BlockStatement } = AbstractSyntaxTree

module.exports = function translation ({ tree, fragment, attrs, options, languages, stack, errors, collectChildren }) {
  const attr = attrs[0]
  const language = attr && attr.key
  fragment.used = true
  const leaf = fragment.children[0]
  if (!leaf) {
    errors.push(createTranslationError('Translation tag cannot be empty', stack))
  } else if (!language) {
    errors.push(createTranslationError('Translation tag needs to have a language attribute', stack))
  } else if (!languages.includes(language)) {
    errors.push(createTranslationError(`Translation tag uses a language that is not specified in compiler options: ${language}`, stack))
  } else {
    const ast = new AbstractSyntaxTree()
    collectChildren(fragment, ast)
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
        body: ast.body
      })
    })
    tree.append(statement)
  }
}
