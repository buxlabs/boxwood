'use strict'

const { rollup } = require('rollup')
const resolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const paths = require('rollup-plugin-includepaths')
const { writeFileSync, unlinkSync } = require('fs')
const { join } = require('path')
const { tmpdir } = require('os')
const { uid } = require('pure-utilities/string')

class Bundler {
  async bundle (source, options = {}) {
    const input = join(tmpdir(), `${uid()}.js`)
    writeFileSync(input, source)
    const bundle = await rollup({
      input,
      plugins: [
        paths({ paths: options.paths }),
        // TODO we could try to find closest node_modules dir here via something like find-node-modules
        resolve(options.resolve),
        commonjs()
      ]
    })
    const { output } = await bundle.generate({ format: 'iife' })
    const { code } = output[0]
    unlinkSync(input)
    return code
  }
}

module.exports = Bundler
