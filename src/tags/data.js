'use strict'

module.exports = function ({ fragment }) {
  fragment.children.forEach(node => {
    node.used = true
  })
}
