const AbstractSyntaxTree = require('abstract-syntax-tree')
const { join } = require('path')
const ESBundler = require('../../Bundler')
const { OBJECT_VARIABLE } = require('../../utilities/enum')

const { CallExpression, ExpressionStatement, FunctionExpression, Identifier, ImportDeclaration, ImportSpecifier, Literal } = AbstractSyntaxTree

function getRenderImportSpecifier () {
  const identifier = new Identifier('render')
  return new ImportSpecifier({
    local: identifier,
    imported: identifier
  })
}

function getRenderCallExpression (node) {
  return new CallExpression({
    callee: new Identifier('render'),
    arguments: [
      new CallExpression({
        callee: new FunctionExpression(node.declaration),
        arguments: [new Identifier(OBJECT_VARIABLE)]
      })
    ]
  })
}

function isBoxwoodImportDeclaration (node) {
  return AbstractSyntaxTree.match(node, 'ImportDeclaration[source.value="boxwood"]')
}

function getBoxwoodImportDeclaration () {
  return new ImportDeclaration({
    specifiers: [getRenderImportSpecifier()],
    source: new Literal('boxwood')
  })
}

function isFunctionExportDeclaration (node) {
  return AbstractSyntaxTree.match(node, 'ExportDefaultDeclaration[declaration.type="FunctionDeclaration"]')
}

class Bundler {
  constructor (options) {
    this.options = options
  }

  async bundle (input) {
    const tree = this.parse(input)

    const bundler = new ESBundler()
    return await bundler.bundle(tree.source, {
      platform: 'node',
      format: 'iife',
      paths: [
        join(__dirname, '../../vdom/server'),
        ...this.options.paths
      ]
    })
  }

  parse (input) {
    const tree = new AbstractSyntaxTree(input)
    let imported = false
    tree.replace(node => {
      if (isBoxwoodImportDeclaration(node)) {
        imported = true
        node.specifiers.push(getRenderImportSpecifier())
      }
    })
    if (!imported) {
      tree.prepend(getBoxwoodImportDeclaration())
    }
    tree.replace(node => {
      if (isFunctionExportDeclaration(node)) {
        return new ExpressionStatement({ expression: getRenderCallExpression(node) })
      }
      return node
    })
    return tree
  }
}

module.exports = Bundler
