'use strict'

const node = require('./node')

function toArray (children) {
  if (Array.isArray(children)) {
    return children
  }
  return [children]
}

function normalize (params) {
  if (params.length === 3) {
    const [name, attributes, children] = params
    return [name, attributes, children]
  }

  if (params.length === 2) {
    if (Array.isArray(params[1]) || typeof params[1] === 'string') {
      const [name, children] = params
      return [name, {}, children]
    }
    const [name, attributes] = params
    return [name, attributes, []]
  }
  if (params.length === 1) {
    const [name] = params
    return [name, {}, []]
  }
  return ['div', {}, []]
}

function tag () {
  const [name, attributes, children] = normalize([...arguments])
  return node({
    name,
    attributes,
    children: toArray(children)
  })
}

module.exports = tag
