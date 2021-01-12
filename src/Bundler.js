'use strict'

const esbuild = require('./bundlers/esbuild')
const rollup = require('./bundlers/rollup')

class Bundler {
  async bundle (source, options = {}) {
    const bundler = options.bundler === 'rollup' ? rollup : esbuild
    return bundler.bundle(source, options)
  }
}

module.exports = Bundler
