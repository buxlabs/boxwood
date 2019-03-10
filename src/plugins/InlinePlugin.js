const Plugin = require('./Plugin')
const { parse, walk, generate } = require('css-tree')
const { findFile } = require('../files')
const { readFileSync } = require('fs')

const SUPPORTED_EXTENSIONS = ['.ttf', '.otf', '.woff', '.woff2', '.svg', '.eot']

function isFileSupported (path) {
  return SUPPORTED_EXTENSIONS
    .map(extension => path.endsWith(extension)).includes(true)
}

class InlinePlugin extends Plugin {
  run ({ fragment, attrs, keys, options }) {
    if (fragment.tagName === 'style' && keys.includes('inline')) {
      const { content } = fragment.children[0]
      const tree = parse(content)
      walk(tree, node => {
        if (node.type === 'Url') {
          const { type, value } = node.value
          if (type === 'Raw' && isFileSupported(value)) {
            findFile(value, options, path => {
              const parts = path.split('.')
              const extension = parts[parts.length - 1]
              const content = readFileSync(path, 'base64')
              node.value.value = `data:application/${extension};charset=utf-8;base64,${content}`
            })
          }
        }
      })
      attrs = attrs.filter(attr => attr.key !== 'inline')
      fragment.children[0].content = generate(tree)
    }
  }
}

module.exports = InlinePlugin
