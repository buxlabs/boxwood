'use strict'

const AbstractSyntaxTree = require('abstract-syntax-tree')
const esbuild = require('./bundlers/esbuild')

class Bundler {
  async bundle (source, options = {}) {
    const tree = new AbstractSyntaxTree(source)
    if (tree.has('ImportDeclaration')) {
      const output = await esbuild.bundle(source, options)
      return output
    } else {
      return source
    }
  }
}

module.exports = Bundler
