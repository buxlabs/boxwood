const { parse, walk, generate } = require('css-tree')
const hash = require('string-hash')
const { isCurlyTag } = require('../string')
const { unique } = require('pure-utilities/array')
const { extractValues } = require('../string')
const Plugin = require('./Plugin')

function addScopeToCssSelectors (node, scopes) {
  const id = `scope-${hash(node.content)}`
  const tree = parse(node.content)
  walk(tree, node => {
    if (node.type === 'SelectorList') {
      node.children.forEach(child => {
        if (child.type === 'Selector') {
          child.children.forEach(leaf => {
            if (leaf.type === 'ClassSelector') {
              scopes.push({ class: leaf.name, id })
            }
          })
          const node = child.children.first()
          if (node.type === 'TypeSelector') { child.children.shift() }
          child.children.unshift({ type: 'ClassSelector', loc: null, name: id })
          if (node.type === 'TypeSelector') { child.children.unshift(node) }
        }
      })
    }
  })
  node.content = generate(tree)
}

function addScopeToHtmlTags (attributes, scopes) {
  const attribute = attributes.find(attribute => attribute.key === 'class')
  const values = extractValues(attribute)
  const classes = values.reduce((strings, string) => {
    strings.push(string)
    if (!isCurlyTag(string)) {
      scopes.forEach(scope => {
        if (scope.class === string) { strings.unshift(scope.id) }
      })
    }
    return strings
  }, [])
  attribute.value = unique(classes).join(' ')
}

class ScopedStylesPlugin extends Plugin {
  constructor () {
    super()
    this.scopes = []
  }
  prerun ({ tag, keys, children }) {
    if (tag === 'style' && keys.includes('scoped')) {
      children.forEach(node => addScopeToCssSelectors(node, this.scopes))
    }
  }
  run ({ keys, attributes }) {
    if (this.scopes.length > 0 && keys && keys.includes('class')) {
      addScopeToHtmlTags(attributes, this.scopes)
    }
  }
}

module.exports = ScopedStylesPlugin
