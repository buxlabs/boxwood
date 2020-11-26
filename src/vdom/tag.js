'use strict'

const node = require('./node')

function tag (name, attributes = {}, children = []) {
  return node({
    name,
    attributes,
    children
  })
}

module.exports = tag
