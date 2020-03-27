'use strict'

const Plugin = require('./Plugin')

class SwappedStylesPlugin extends Plugin {
  run ({ children, options }) {
    const { styles } = options
    if (styles && styles.colors && Object.keys(styles.colors).length) {
      children.forEach(node => swapStyles(node, styles.colors))
    }
  }
}

function swapStyles (node, colors) {
  for (const color in colors) {
    if (node.content.includes(color)) node.content = node.content.replace(color, colors[color])
  }
}

module.exports = SwappedStylesPlugin
