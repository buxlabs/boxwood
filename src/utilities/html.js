'use strict'

const { parse: parseHTML, stringify: stringifyHTML, parseDefaults } = require('himalaya')
const walk = require('himalaya-walk')
const { VOID_TAGS } = require('./enum')
const { getComponentNames } = require('./attributes')
const { isImportTag } = require('./string')

function matchImportTags (source) {
  return source.match(/<import[\s\S]*?>[\s\S]*?>/gi)
}

function getImportTags (source) {
  const imports = matchImportTags(source)
  if (!imports) return []
  return imports.join('')
}

function deduceVoidTags (source) {
  const tags = []
  const imports = getImportTags(source)
  const tree = parseHTML(imports)
  walk(tree, node => {
    if (isImportTag(node.tagName)) {
      getComponentNames(node.attributes).forEach(tag => {
        tags.push(tag)
      })
    }
  })

  return VOID_TAGS.concat(parseDefaults.voidTags).filter(name => {
    return !tags.includes(name)
  })
}

function defaults (source, options) {
  const voidTags = deduceVoidTags(source)
  // we could also potentially decide if the tag is self closing (void)
  // based on the existence of a slot inside of the component
  // right now every imported component must use />
  // another option is that the user could specify it, e.g. by:
  // - passing global options,
  // - setting it as an attribute on the import tag
  return { ...parseDefaults, voidTags, ...options }
}

function parse (source, options) {
  return parseHTML(source, defaults(source, options))
}

function stringify (tree, source, options) {
  return stringifyHTML(tree, defaults(source, options))
}

module.exports = {
  defaults,
  parse,
  stringify,
  walk
}
