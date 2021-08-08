const esbuild = require('esbuild')
const AbstractSyntaxTree = require('abstract-syntax-tree')
const { writeFileSync, existsSync, unlinkSync, promises: { readFile } } = require('fs')
const { join } = require('path')
const { tmpdir } = require('os')
const { uid } = require('pure-utilities/string')
const { transpile: transpileCSS, getSelectors } = require('../transpilers/css')
const { transpile: transpileHTML } = require('../transpilers/html')

const bundle = async (source, options = {}) => {
  const paths = options.paths || []
  const styles = []
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
          contents: transpileHTML(content.trim()),
          loader: 'js'
        }
      })
    }
  }

  const cssPlugin = {
    name: 'css',
    setup (build) {
      build.onResolve({ filter: /\.css?$/ }, args => ({
        path: args.path.replace(/\.css$/, ''),
        namespace: 'boxwood-css'
      }))
      build.onLoad({
        filter: /.*/,
        namespace: 'boxwood-css'
      }, async (args) => {
        const file = findFile(args.path, 'css')
        if (!file) {
          // throw with a nice error message and add specs
        }
        const content = await readFile(file.path, 'utf8')
        const style = transpileCSS(content)
        const selectors = getSelectors(style)
        // TODO transform css classes
        // return a map of names
        styles.push(style)
        return {
          contents: `export default ${JSON.stringify(selectors)}`,
          loader: 'js'
        }
      })
    }
  }

  writeFileSync(input, source)
  const result = await esbuild.build({
    platform: options.platform || 'node',
    bundle: true,
    plugins: [resolvePlugin, htmlPlugin, cssPlugin],
    entryPoints: [input],
    format: options.format || 'iife',
    minify: true,
    write: false,
    target: 'es2016'
  })
  const file = result.outputFiles[0]
  unlinkSync(input)
  const tree = new AbstractSyntaxTree(file.text)
  tree.replace(node => {
    // TODO we need a better way to match the global scoped style tag
    // this could lead to false
    if (
      node.type === 'ObjectExpression' &&
      node.properties.length === 1 &&
      node.properties[0].type === 'Property' &&
      node.properties[0].key.type === 'Identifier' &&
      node.properties[0].key.name === 'scoped'
    ) {
      return { type: 'Literal', value: styles.join(' ') }
    }
    return node
  })
  return tree.source
}

module.exports = { bundle }
