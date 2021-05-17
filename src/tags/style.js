'use strict'

module.exports = function ({ fragment, styles }) {
  if (fragment.children?.length > 0) {
    const { content } = fragment.children[0]
    styles.push(content)
    fragment.children[0].used = true
  }
}
