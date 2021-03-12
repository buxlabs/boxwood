const walk = require('himalaya-walk')

class Preprocessor {
  preprocess (tree) {
    const references = {}
    const styles = []

    // 1. find style tags, collect and remove them
    // 2. inject styles into the head

    // things that are missing
    // - use the scoped styles plugin first
    // - handle imported components

    // it would be nicer to do this in a more functional way, like `abstract-syntax-tree` lib
    //

    tree = tree.map(node => {
      if (node.tagName === 'style') {
        styles.push(node)
        return null
      }
      return node
    }).filter(Boolean)
    walk(tree, (node) => {
      if (node.tagName === 'head') {
        references.head = node
      }
      if (node.children) {
        for (let i = 0, ilen = node.children.length; i < ilen; i += 1) {
          const leaf = node.children[i]
          if (leaf.tagName === 'style') {
            styles.push(leaf)
            node.children[i] = null
          }
        }
        node.children = node.children.filter(Boolean)
      }
    })

    if (styles.length > 0) {
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

    return tree
  }
}

module.exports = Preprocessor
