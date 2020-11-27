'use strict'

const render = require('./render')
const replace = require('./replace')

const diffAttributes = (previousAttributes, nextAttributes) => {
  const patches = []

  for (const key in nextAttributes) {
    const value = nextAttributes[key]
    patches.push(node => {
      // similar code is in the render method
      if (key === 'onclick') {
        // setting event handlers like this is
        // not efficient, e.g. for lists of items
        // it would be better to have one global handler
        node.addEventListener('click', value)
      } else {
        node.setAttribute(key, value)
      }
    })
  }

  for (const key in previousAttributes) {
    if (!nextAttributes[key]) {
      patches.push(node => {
        node.removeAttribute(key)
        return node
      })
    }
  }

  return node => {
    for (const patch in patches) {
      patch(node)
    }
    return node
  }
}

const diffChildren = (previousChildren, nextChildren) => {
  const patches = []

  previousChildren.forEach((child, index) => {
    patches.push(diff(child, nextChildren[index]))
  })

  const additionalPatches = []

  for (const child of nextChildren.slice(previousChildren.length)) {
    additionalPatches.push(node => {
      node.appendChild(render(child))
      return node
    })
  }

  return node => {
    node.childNodes.forEach((child, index) => {
      patches[index](child)
    })

    for (const patch of additionalPatches) {
      patch(node)
    }

    return node
  }
}

function diff (previousTree, nextTree) {
  if (nextTree === undefined) {
    return node => {
      node.remove()
      return undefined
    }
  }

  if (typeof previousTree === 'string' || typeof nextTree === 'string') {
    if (previousTree !== nextTree) {
      return node => {
        const newNode = render(nextTree)
        replace(node, newNode)
        return newNode
      }
    } else {
      return node => node
    }
  }

  if (previousTree.tag !== nextTree.tag) {
    return node => {
      const newNode = render(nextTree)
      replace(node, newNode)
      return newNode
    }
  }

  const patchAttributes = diffAttributes(previousTree.attributes, nextTree.attributes)
  const patchChildren = diffChildren(previousTree.children, nextTree.children)

  return node => {
    patchAttributes(node)
    patchChildren(node)
    return node
  }
}

module.exports = diff
