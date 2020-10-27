const AbstractSyntaxTree = require('abstract-syntax-tree')
const Generator = require('../../Generator')
const Features = require('./Features')
const {
  isTag,
  isText,
  isState,
  convertTag,
  isInternalImportDeclaration,
  convertExportDefaultDeclarationToReturnStatement,
  enableUsedFeatures
} = require('./utilities/convert')

const { ObjectExpression } = AbstractSyntaxTree

class Compiler {
  constructor (options) {
    this.options = options
  }

  async compile (input) {
    const tree = new AbstractSyntaxTree(input)

    const features = new Features({
      tag: false,
      text: false,
      State: false
    })

    tree.replace(node => {
      enableUsedFeatures(node, features)
      if (features.enabled('tag') && isTag(node)) {
        return convertTag(node)
      } else if (features.enabled('text') && isText(node)) {
        return node.arguments[0]
      } else if (features.enabled('State') && isState(node)) {
        return new ObjectExpression(node.arguments[0])
      } else if (node.type === 'ExportDefaultDeclaration') {
        return convertExportDefaultDeclarationToReturnStatement(node)
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
