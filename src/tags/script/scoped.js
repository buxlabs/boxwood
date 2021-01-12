'use strict'

const AbstractSyntaxTree = require('abstract-syntax-tree')
const { join } = require('path')
const Bundler = require('../../Bundler')

function scoped ({ source, paths, attrs }) {
  const tree = new AbstractSyntaxTree(source)
  tree.replace(node => {
    if (node.type === 'ImportDeclaration' && node.source.value === 'boxwood') {
      node.source.value = '.'
    }
    return node
  })
  const bundlerAttr = attrs.find(attr => attr.key === 'bundler')
  const bundler = new Bundler()
  return bundler.bundle(tree.source, {
    paths: [
      join(__dirname, '../../vdom/browser'),
      ...paths
    ],
    bundler: bundlerAttr ? bundlerAttr.key : 'esbuild'
  })
}

module.exports = scoped
