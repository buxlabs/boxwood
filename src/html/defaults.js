const { parse, parseDefaults } = require('himalaya')
const { VOID_TAGS } = require('../enum')
const walk = require('himalaya-walk')

function matchImportTags (source) {
  return source.match(/<import[\s\S]*?>[\s\S]*?>/gi)
}

function getImportTags (source) {
  const imports = matchImportTags(source)
  if (!imports) return []
  return imports.join('')
}

function getTags (attributes) {
  const { key } = attributes[0]
  // TODO support other syntax, e.g.
  // <import foo,bar from="./components" />
  // <import foo, bar from="./components" />
  // <import {foo,bar} from="./components" />
  // <import { foo,bar} from="./components" />
  // <import {foo,bar } from="./components" />
  // <import { foo,bar } from="./components" />
  // <import { foo, bar } from="./components" />
  // <import { foo , bar } from="./components" />
  return [key]
}

function deduceVoidTags (source) {
  const tags = []
  const imports = getImportTags(source)
  const tree = parse(imports)
  walk(tree, node => {
    if (node.tagName === 'import' || node.tagName === 'require') {
      getTags(node.attributes).forEach(tag => {
        tags.push(tag)
      })
    }
  })

  return VOID_TAGS.concat(parseDefaults.voidTags).filter(name => {
    return !tags.includes(name)
  })
}

module.exports = function defaults (source, options) {
  const voidTags = deduceVoidTags(source)
  // we could also potentially decide if the tag is self closing (void)
  // based on the existence of a slot inside of the component
  // right now every imported component must use />
  // another option is that the user could specify it, e.g. by:
  // - passing global options,
  // - setting it as an attribute on the import tag
  return { ...parseDefaults, voidTags, ...options }
}
