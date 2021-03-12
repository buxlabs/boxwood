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
    while(child) {
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
  preprocess (tree) {
    const references = {}
    const styles = []

    // things that are missing
    // - use the scoped styles plugin first
    // - handle imported components

    // it would be nicer to do this in a more functional way, like `abstract-syntax-tree` lib
    //

    walk(tree, node => {
      if (node.tagName === 'head') {
        references.head = node
      } else if (node.tagName === 'style') {
        styles.push(node)
      }
    })
    tree = remove(tree, node => {
      return node && node.tagName === 'style'
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
