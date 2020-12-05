'use strict'

const node = require('./node')

function toArray (children) {
  return Array.isArray(children) ? children : [children]
}

function deduceParams (params) {
  if (params.length === 3) { return params }
  if (params.length === 2) {
    if (Array.isArray(params[1]) || typeof params[1] === 'string') {
      const [name, children] = params
      return [name, {}, children]
    }
    return params
  }
  if (params.length === 1) { return params }
  return ['div']
}

function tag () {
  const [name, attributes = {}, children = []] = deduceParams([...arguments])
  return node({
    name,
    attributes,
    children: toArray(children)
  })
}

module.exports = tag
