'use strict'

const { parse, walk, generate } = require('css-tree')
const { hash } = require('../../utilities/string')
const { normalizeNewline } = require('../../utilities/string')

function addScopeToCssSelectors (input, scopes) {
  const content = normalizeNewline(input).trim()
  const id = hash(content)
  const tree = parse(content)
  const keyframes = {}
  walk(tree, node => {
    if (node.type === 'Atrule' && node.name === 'keyframes') {
      const child = node.prelude.children.first()
      const marker = `${child.name}-${id}`
      keyframes[child.name] = marker
      child.name = marker
    }
    if (node.type === 'SelectorList') {
      node.children.forEach(child => {
        if (child.type === 'Selector') {
          let hasScope = false
          child.children.forEach(leaf => {
            if (leaf.type === 'ClassSelector' && !hasScope) {
              scopes.push({ type: 'class', name: leaf.name, id })
              hasScope = true
            } else if (leaf.type === 'TypeSelector' && !hasScope) {
              scopes.push({ type: 'tag', name: leaf.name, id })
              hasScope = true
            }
          })
          if (hasScope) {
            const node = child.children.first()
            if (node.type === 'TypeSelector') { child.children.shift() }
            child.children.unshift({ type: 'ClassSelector', loc: null, name: id })
            if (node.type === 'TypeSelector') { child.children.unshift(node) }
          }
        }
      })
    }
  })
  function isAnimationProperty (property) {
    return property === 'animation' || property === 'animation-name'
  }
  walk(tree, node => {
    if (node.type === 'Declaration' && isAnimationProperty(node.property)) {
      const child = node.value.children.first()
      if (keyframes[child.name]) {
        child.name = keyframes[child.name]
      }
    }
  })
  return generate(tree)
}

module.exports = { addScopeToCssSelectors }
