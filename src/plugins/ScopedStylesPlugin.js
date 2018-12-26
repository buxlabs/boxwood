const { parse, walk, generate } = require('css-tree')
const hash = require('string-hash')
const { isCurlyTag } = require('../string')
const { unique } = require('pure-utilities/array')

function addScopeToCssSelectors (node, scopes) {
  const id = `scope-${hash(node.content)}`
  const tree = parse(node.content)
  walk(tree, (node, parent) => {
    if (node.type === 'ClassSelector' && !parent.next) {
      scopes.push({ class: node.name, id })
      parent.next = {
        prev: parent,
        next: null,
        data: { type: 'ClassSelector', loc: null, name: id }
      }
    }
  })
  node.content = generate(tree)
}

function addScopeToHtmlTags (attributes, scopes) {
  const attribute = attributes.find(attribute => attribute.key === 'class')
  const values = attribute.value.split(/\s+/g)
  const classes = values.reduce((strings, string) => {
    strings.push(string)
    if (!isCurlyTag(string)) {
      scopes.forEach(scope => {
        if (scope.class === string) { strings.push(scope.id) }
      })
    }
    return strings
  }, [])
  attribute.value = unique(classes).join(' ')
}

class ScopedStylesPlugin {
  constructor () {
    this.scopes = []
  }
  prepare ({ tag, keys, children }) {
    if (tag === 'style' && keys.includes('scoped')) {
      children.forEach(node => addScopeToCssSelectors(node, this.scopes))
    }
  }
  run ({ keys, attributes }) {
    if (this.scopes.length > 0 && keys.includes('class')) {
      addScopeToHtmlTags(attributes, this.scopes)
    }
  }
}

module.exports = ScopedStylesPlugin
