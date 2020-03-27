'use strict'

const AbstractSyntaxTree = require('abstract-syntax-tree')
const { parse, walk, generate } = require('css-tree')
const hash = require('string-hash')
const { unique } = require('pure-utilities/array')
const { extractValues, getTagValue, isCurlyTag, isSquareTag } = require('../utilities/string')
const Plugin = require('./Plugin')
const normalize = require('normalize-newline')

function addScopeToCssSelectors (node, scopes, attributes) {
  const content = normalize(node.content).trim()
  const scope = attributes.find(attribute => attribute.key === 'scoped')
  const id = `scope-${hash(content)}`
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
            if (scope && scope.value) {
              child.children.unshift(
                {
                  type: 'ClassSelector',
                  loc: null,
                  name: `${scope.value} `
                }
              )
            }
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
  node.content = generate(tree)
}

function addScopeToHtmlClassAttribute (tag, attributes, scopes) {
  const attribute = attributes.find(attribute => attribute.key === 'class')
  const values = extractValues(attribute)
  const classes = values.reduce((strings, string) => {
    if (isCurlyTag(string)) {
      strings.push(string)
      const source = getTagValue(string)
      const tree = new AbstractSyntaxTree(source)
      tree.walk(node => {
        if (node.type === 'Literal' && typeof node.value === 'string') {
          const candidate = node.value.trim()
          if (candidate) {
            const parts = candidate.split(/\s+/g)
            scopes.forEach(scope => {
              if (scope.type === 'class' && parts.includes(scope.name)) {
                strings.unshift(scope.id)
              }
            })
          }
        }
      })
    } else if (isSquareTag(string)) {
      const isStringLiteral = (node) => {
        return node.type === 'Literal' && typeof node.value === 'string'
      }
      const isTemplateLiteral = (node) => {
        return node.type === 'TemplateLiteral'
      }
      const setScopeFromStringLiteral = (node) => {
        const candidate = node.value.trim()
        if (candidate) {
          const parts = candidate.split(/\s+/g)
          scopes.forEach(scope => {
            if (scope.type === 'class' && parts.includes(scope.name)) {
              strings.unshift(scope.id)
            }
          })
        }
      }
      const setScopeFromTemplateLiteral = (node) => {
        const { quasis } = node
        quasis.forEach(item => {
          const { raw } = item.value
          if (typeof raw === 'string') {
            const parts = raw.split(/\s+/g)
            scopes.forEach(scope => {
              if (scope.type === 'class' && parts.includes(scope.name)) {
                strings.unshift(scope.id)
              }
            })
          }
        })
      }
      const source = string
      const tree = new AbstractSyntaxTree(source)
      AbstractSyntaxTree.walk(tree, node => {
        if (isStringLiteral(node)) { setScopeFromStringLiteral(node) }
        if (isTemplateLiteral(node)) { setScopeFromTemplateLiteral(node) }
      })
      tree.body[0].expression.elements.forEach(node => {
        if (isStringLiteral(node)) {
          strings.push(node.value)
        } else {
          const expression = AbstractSyntaxTree.generate(node)
          strings.push(`{${expression}}`)
        }
      })
    } else {
      strings.push(string)
      scopes.forEach(scope => {
        if (scope.type === 'class' && scope.name === string) {
          strings.unshift(scope.id)
        }
      })
    }
    return strings
  }, [])
  scopes.forEach(scope => {
    if (scope.type === 'tag' && scope.name === tag) {
      classes.unshift(scope.id)
    }
  })
  attribute.value = unique(classes).join(' ')
}

function addClassAttributeWithScopeToHtmlTag (tag, attributes, scopes) {
  const matchesAnyScope = !!scopes.find(scope => scope.type === 'tag' && scope.name === tag)
  if (matchesAnyScope) {
    attributes.push({
      key: 'class',
      value: scopes.reduce((array, scope) => {
        if (tag === scope.name) {
          array.push(scope.id)
        }
        return array
      }, []).join(' ')
    })
  }
}

class ScopedStylesPlugin extends Plugin {
  constructor () {
    super()
    this.scopes = {}
  }

  beforeprerun () {
    this.scopes[this.depth] = []
  }

  prerun ({ tag, keys, children, attributes }) {
    if (tag === 'style' && keys.includes('scoped')) {
      children.forEach(node => addScopeToCssSelectors(node, this.scopes[this.depth], attributes))
    }
  }

  run ({ tag, keys, attributes }) {
    if (this.scopes[this.depth].length > 0) {
      if (keys && keys.includes('class')) {
        addScopeToHtmlClassAttribute(tag, attributes, this.scopes[this.depth])
      } else {
        addClassAttributeWithScopeToHtmlTag(tag, attributes, this.scopes[this.depth])
      }
    }
  }
}

module.exports = ScopedStylesPlugin
