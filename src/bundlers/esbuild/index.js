const esbuild = require('esbuild')
const AbstractSyntaxTree = require('abstract-syntax-tree')
const { writeFileSync, unlinkSync } = require('fs')
const { join } = require('path')
const { tmpdir } = require('os')
const { uid } = require('pure-utilities/string')
const ResolvePlugin = require('./plugins/resolve')
const HTMLPlugin = require('./plugins/html')
const CSSPlugin = require('./plugins/css')
const YAMLPlugin = require('./plugins/yaml')
const ImagePlugin = require('./plugins/image')

const bundle = async (source, options = {}) => {
  const paths = options.paths || []
  const styles = []
  const input = join(tmpdir(), `${uid()}.js`)

  writeFileSync(input, source)
  const result = await esbuild.build({
    platform: options.platform || 'node',
    bundle: true,
    plugins: [
      ResolvePlugin({ paths }),
      HTMLPlugin({ paths }),
      CSSPlugin({ paths, styles }),
      YAMLPlugin({ paths }),
      ImagePlugin({ paths })
    ],
    entryPoints: [input],
    format: options.format || 'iife',
    minify: false,
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
