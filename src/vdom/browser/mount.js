'use strict'

const replace = require('./replace')

function mount (node, target) {
  replace(target, node)
  return node
}

module.exports = mount
