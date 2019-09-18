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
    const output = await this.transform(source, options)
    return output
  }

  async transform (source, options) {
    const id = uid()
    const filename = `${id}.js`
    const filepath = join(tmpdir(), filename)
    writeFileSync(filepath, source)
    const bundle = await rollup({
      input: filepath,
      plugins: [
        paths({ paths: options.paths }),
        // TODO we could try to find closest node_modules dir here via something like find-node-modules
        resolve(options.resolve),
        commonjs()
      ]
    })
    const { output } = await bundle.generate({
      format: 'iife'
    })
    const { code } = output[0]
    unlinkSync(filepath)
    return code
  }
}

module.exports = Bundler
