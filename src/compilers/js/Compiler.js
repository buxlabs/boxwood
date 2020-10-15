const AbstractSyntaxTree = require('abstract-syntax-tree')
const Generator = require('../../Generator')
const Features = require('./Features')
const {
  isTag,
  isText,
  convertLastNode,
  convertLiteral,
  convertTag,
  convertBinaryExpression,
  convertObjectExpression,
  wrapNode,
  getAttributes,
  startTag,
  endTag,
  isInternalImportDeclaration,
  isFeatureImportSpecifier
} = require('./utilities/convert')

const { match } = AbstractSyntaxTree

class Compiler {
  constructor (options) {
    this.options = options
  }

  async compile (input) {
    const tree = new AbstractSyntaxTree(input)

    const features = new Features({
      tag: false,
      text: false
    })

    tree.replace(node => {
      if (isInternalImportDeclaration(node)) {
        node.specifiers.forEach(specifier => {
          features.each(feature => {
            if (isFeatureImportSpecifier(specifier, feature)) {
              features.enable(feature)
            }
          })
        })
      }
      if (features.enabled('tag') && isTag(node)) {
        return convertTag(node)
      } else if (features.enabled('text') && isText(node)) {
        return node.arguments[0]
      } else if (node.type === 'ExportDefaultDeclaration') {
        const { declaration } = node
        declaration.type = 'FunctionExpression'
        const { body } = declaration.body
        const last = body[body.length - 1]
        if (last.type === 'ReturnStatement' && last.argument.type === 'ArrayExpression') {
          const { elements } = last.argument
          if (elements.find(isTag)) {
            if (elements.length === 1) { last.argument = elements[0] }
            if (elements.length === 2) { last.argument = { type: 'BinaryExpression', left: elements[0], right: elements[1], operator: '+' } }
            let expression = { type: 'BinaryExpression', left: elements[0], right: elements[1], operator: '+' }
            for (let i = 2, ilen = elements.length; i < ilen; i += 1) {
              expression = { type: 'BinaryExpression', left: expression, right: elements[i], operator: '+' }
            }
            last.argument = expression
          }
        }
        return {
          type: 'ReturnStatement',
          argument: {
            type: 'CallExpression',
            callee: declaration,
            arguments: []
          }
        }
      }
      return node
    })

    tree.remove(node => {
      if (isInternalImportDeclaration(node)) { return null }
      return node
    })

    const generator = new Generator()
    return generator.generate(tree)
  }
}

module.exports = Compiler
