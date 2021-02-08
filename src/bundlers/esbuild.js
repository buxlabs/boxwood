const esbuild = require('esbuild')
const { writeFileSync, existsSync, unlinkSync, promises: { readFile } } = require('fs')
const { join } = require('path')
const { tmpdir } = require('os')
const { uid } = require('pure-utilities/string')
const { transpile } = require('../transpilers/html')

const bundle = async (source, options = {}) => {
  const paths = options.paths || []
  const input = join(tmpdir(), `${uid()}.js`)

  function findFile (filepath, extension = 'js') {
    for (let i = 0, ilen = paths.length; i < ilen; i += 1) {
      const path = join(paths[i], `${filepath}.${extension}`)
      const index = join(paths[i], filepath, `index.${extension}`)
      if (existsSync(path)) {
        return { path }
      } else if (existsSync(index)) {
        return { path: index }
      }
    }
  }

  const resolvePlugin = {
    name: 'resolve',
    setup (build) {
      build.onResolve({ filter: /.*/ }, args => {
        // TODO handle libs from node_modules out of the box
        return findFile(args.path)
      })
    }
  }

  const htmlPlugin = {
    name: 'html',
    setup (build) {
      build.onResolve({ filter: /\.html?$/ }, args => ({
        path: args.path.replace(/\.html$/, ''),
        namespace: 'boxwood-html'
      }))

      build.onLoad({
        filter: /.*/,
        namespace: 'boxwood-html'
      }, async (args) => {
        const file = findFile(args.path, 'html')
        if (!file) {
          // throw with a nice error message and add specs
        }
        const content = await readFile(file.path, 'utf8')
        return {
          contents: transpile(content.trim()),
          loader: 'js'
        }
      })
    }
  }

  writeFileSync(input, source)
  const result = await esbuild.build({
    platform: options.platform || 'node',
    bundle: true,
    plugins: [resolvePlugin, htmlPlugin],
    entryPoints: [input],
    format: options.format || 'iife',
    minify: true,
    write: false,
    target: 'es2016'
  })
  const file = result.outputFiles[0]
  unlinkSync(input)
  return file.text
}

module.exports = { bundle }
