'use strict'

const esbuild = require('./bundlers/esbuild')

class Bundler {
  async bundle (source, options = {}) {
    return esbuild.bundle(source, options)
  }
}

module.exports = Bundler
