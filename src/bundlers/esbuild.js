const esbuild = require('esbuild')
const { writeFileSync, existsSync, unlinkSync } = require('fs')
const { join } = require('path')
const { tmpdir } = require('os')
const { uid } = require('pure-utilities/string')

const bundle = async (source, options = {}) => {
  const paths = options.paths || []
  const input = join(tmpdir(), `${uid()}.js`)

  const resolvePlugin = {
    name: 'example',
    setup (build) {
      build.onResolve({ filter: /.*/ }, args => {
        // TODO handle libs from node_modules out of the box
        for (let i = 0, ilen = paths.length; i < ilen; i += 1) {
          const path = join(paths[i], `${args.path}.js`)
          const index = join(paths[i], args.path, 'index.js')
          if (existsSync(path)) {
            return { path }
          } else if (existsSync(index)) {
            return { path: index }
          }
        }
      })
    }
  }

  writeFileSync(input, source)
  const result = await esbuild.build({
    platform: 'node',
    bundle: true,
    plugins: [resolvePlugin],
    entryPoints: [input],
    format: 'iife',
    minify: true,
    write: false,
    target: 'es2016'
  })
  const file = result.outputFiles[0]
  unlinkSync(input)
  return file.text
}

module.exports = { bundle }
