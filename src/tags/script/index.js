'use strict'

const { getLiteral } = require('../../utilities/ast')
const { containsCurlyTag } = require('../../utilities/string')
const { convertAttribute } = require('../../utilities/convert')
const scoped = require('./scoped')

const script = { scoped }

module.exports = async function ({ tree, keys, attrs, fragment, assets, variables, promises, warnings, filters, translations, languages, append, scripts, options }) {
  if (keys.includes('scoped')) {
    const leaf = fragment.children[0]
    if (!leaf) return
    leaf.used = true
    const promise = script.scoped({
      source: leaf.content,
      paths: options.script.paths,
      attrs
    })
    promises.push(promise)
    const output = await promise
    scripts.push(output)
  } else if (keys.includes('compiler')) {
    const { value } = attrs.find(attr => attr.key === 'compiler')
    const compiler = options.compilers[value]
    // TODO errors.push when given compiler is not available
    if (typeof compiler === 'function') {
      const attr = attrs.find(attr => attr.key === 'options')
      const params = attr && attr.value && JSON.parse(attr.value)
      const leaf = fragment.children[0]
      leaf.used = true
      const output = compiler(leaf.content, params)
      if (typeof output === 'string') {
        scripts.push(output)
      } else if (output instanceof Promise) {
        promises.push(output)
        const source = await output
        scripts.push(source)
      }
    }
  } else if (keys.includes('src')) {
    append(getLiteral('<script'))
    fragment.attributes.forEach(attribute => {
      if (containsCurlyTag(attribute.value)) {
        append(getLiteral(` ${attribute.key}="`))
        append(convertAttribute(attribute.key, attribute.value, variables, filters, translations, languages))
        append(getLiteral('"'))
      } else if (attribute.value) {
        append(getLiteral(` ${attribute.key}="${attribute.value}"`))
      } else {
        append(getLiteral(` ${attribute.key}`))
      }
    })
    append(getLiteral('>'))
    fragment.children.forEach(node => {
      node.used = true
      append(getLiteral(node.content))
    })
    append(getLiteral('</script>'))
  } else {
    fragment.children.forEach(node => {
      node.used = true
      const { content } = node
      scripts.push(content)
    })
  }
}
