const AbstractSyntaxTree = require('abstract-syntax-tree')
const { join } = require('path')
const ESBundler = require('../../Bundler')

class Bundler {
  constructor (options) {
    this.options = options
  }

  async bundle (input) {
    const tree = new AbstractSyntaxTree(input)
    let scoped = false
    tree.replace(node => {
      if (node.type === 'ImportDeclaration' && node.source.value === 'boxwood') {
        scoped = true
        node.specifiers.push({
          type: 'ImportSpecifier',
          local: { type: 'Identifier', name: 'render' },
          imported: { type: 'Identifier', name: 'render' }
        })
      }
    })
    if (!scoped) {
      scoped = true
      tree.prepend({
        type: 'ImportDeclaration',
        specifiers: [
          {
            type: 'ImportSpecifier',
            local: { type: 'Identifier', name: 'render' },
            imported: { type: 'Identifier', name: 'render' }
          }
        ],
        source: {
          type: 'Literal',
          value: 'boxwood'
        }
      })
    }
    tree.replace(node => {
      if (scoped && node.type === 'ExportDefaultDeclaration' && node.declaration.type === 'FunctionDeclaration') {
        return {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: {
              type: 'Identifier',
              name: 'render'
            },
            arguments: [
              {
                type: 'CallExpression',
                callee: { ...node.declaration, type: 'FunctionExpression' }
              }
            ]
          }
        }
      }
      return node
    })
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
}

module.exports = Bundler
