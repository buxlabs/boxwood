const ScopedStylesPlugin = require('../../plugins/ScopedStylesPlugin')
const InlinePlugin = require('../../plugins/InlinePlugin')
const SwappedStylesPlugin = require('../../plugins/SwappedStylesPlugin')

const plugins = [
  new InlinePlugin(),
  new ScopedStylesPlugin(),
  new SwappedStylesPlugin()
]

function walk (node, callback) {
  let children
  if (Array.isArray(node)) {
    children = node
  } else {
    callback(node)
    children = node.children
  }
  if (children) {
    let child = children[0]
    let i = 0
    while (child) {
      walk(child, callback)
      child = children[++i]
    }
  }
}

function remove (tree, callback) {
  tree = tree.map(node => {
    if (callback(node)) {
      return null
    }
    return node
  }).filter(Boolean)
  walk(tree, node => {
    if (node.children) {
      for (let i = 0, ilen = node.children.length; i < ilen; i++) {
        if (callback(node.children[i])) {
          node.children[i] = null
        }
      }
      node.children = node.children.filter(Boolean)
    }
  })
  return tree
}

class Preprocessor {
  preprocess (tree, assets, options) {
    const references = {}
    const styles = []

    // things that are missing
    // - use the scoped styles plugin first
    // - handle imported components

    // it would be nicer to do this in a more functional way, like `abstract-syntax-tree` lib
    //

    plugins.forEach(plugin => {
      plugin.depth += 1
      plugin.beforeprerun()
    })

    walk(tree, node => {
      if (node.tagName === 'head') {
        references.head = node
      } else if (node.tagName === 'style') {
        styles.push(node)
        plugins.forEach(plugin => {
          plugin.prerun({
            tag: node.tagName,
            keys: node.attributes.map(leaf => leaf.key),
            attributes: node.attributes,
            attrs: node.attributes,
            children: node.children || [],
            fragment: node,
            assets,
            options
          })
        })
      }
    })
    plugins.forEach(plugin => { plugin.afterprerun() })
    plugins.forEach(plugin => { plugin.beforerun() })
    walk(tree, node => {
      plugins.forEach(plugin => {
        plugin.run({
          tag: node.tagName,
          keys: node.attributes && node.attributes.map(leaf => leaf.key),
          fragment: node,
          attributes: node.attributes,
          assets,
          options,
          children: node.children || []
        })
      })
    })
    plugins.forEach(plugin => {
      plugin.afterrun()
      plugin.depth -= 1
    })

    tree = remove(tree, node => {
      return node && node.tagName === 'style'
    })

    if (styles.length > 0 && references.head) {
      references.head.children.push({
        type: 'element',
        tagName: 'style',
        attributes: [],
        children: [
          {
            type: 'text',
            content: styles.reduce((result, style) => {
              const { content } = style.children[0]
              return result + content
            }, '')
          }
        ]
      })
    }

    return { tree, styles }
  }
}

module.exports = Preprocessor
