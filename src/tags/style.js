'use strict'

module.exports = function ({ fragment, styles }) {
  const { content } = fragment.children[0]
  styles.push(content)
  fragment.children[0].used = true
}
