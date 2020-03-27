'use strict'

const marked = require('marked')

module.exports = function ({ fragment, tree }) {
  const { content } = fragment.children[0]
  fragment.children[0].content = marked(content)
}
