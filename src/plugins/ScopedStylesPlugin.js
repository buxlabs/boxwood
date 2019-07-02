const { parse, walk, generate } = require('css-tree')
const hash = require('string-hash')
const { isCurlyTag } = require('../string')
const { unique } = require('pure-utilities/array')
const { extractValues } = require('../string')
const Plugin = require('./Plugin')
const normalize = require('normalize-newline')

function addScopeToCssSelectors (node, scopes, attributes) {
  const content = normalize(node.content).trim()
  const scope = attributes.find(attribute => attribute.key === 'scoped')
  const id = `scope-${hash(content)}`
  const tree = parse(content)
  walk(tree, node => {
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
      })
    }
  })
  node.content = generate(tree)
}

function addScopeToHtmlClassAttribute (tag, attributes, scopes) {
  const attribute = attributes.find(attribute => attribute.key === 'class')
  const values = extractValues(attribute)
  const classes = values.reduce((strings, string) => {
    strings.push(string)
    if (!isCurlyTag(string)) {
      scopes.forEach(scope => {
        if (
          (scope.type === 'class' && scope.name === string) ||
          (scope.type === 'tag' && scope.name === tag)
        ) {
          strings.unshift(scope.id)
        }
      })
    }
    return strings
  }, [])
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
  beforeprerun () {
    this.scopes = []
  }
  prerun ({ tag, keys, children, attributes }) {
    if (tag === 'style' && keys.includes('scoped')) {
      children.forEach(node => addScopeToCssSelectors(node, this.scopes, attributes))
    }
  }
  run ({ tag, keys, attributes }) {
    if (this.scopes.length > 0) {
      if (keys && keys.includes('class')) {
        addScopeToHtmlClassAttribute(tag, attributes, this.scopes)
      } else {
        addClassAttributeWithScopeToHtmlTag(tag, attributes, this.scopes)
      }
    }
  }
  afterrun () {
    this.scopes = []
  }
}

module.exports = ScopedStylesPlugin
