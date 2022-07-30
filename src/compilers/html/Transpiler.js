'use strict'

const { isCurlyTag, getTagValue } = require('../../utilities/string')
const { SPECIAL_TAGS } = require('../../utilities/enum')
const tokenize = require('../../lexers/html')

const transform = (tokens) => {
  const output = []
  const imports = []
  let lastTag
  tokens.forEach((token, index) => {
    const [type, value] = token
    const next = tokens[index + 1]
    if (type === 'tagName') {
      lastTag = value
      output.push(token)
    } else if (type === 'attributeName' && (lastTag === 'import' || lastTag === 'require')) {
      const [, value] = token
      if (value !== 'from' && value !== '{' && value !== '}') {
        // TODO unify with getComponentNames
        const parts = value.replace('{', '').replace('}', '').split(/,/g).map(key => key.trim()).filter(Boolean)
        parts.forEach(part => imports.push(part))
      }
      output.push(token)
    } else if (type === 'attributeName' && isCurlyTag(value) && next && next[0] !== 'attributeAssign') {
      const tags = SPECIAL_TAGS.filter(tag => !imports.includes(tag))
      if (tags.includes(lastTag)) {
        output.push(token)
      } else {
        output.push(['attributeName', getTagValue(value)])
        output.push(['attributeAssign', '='])
        output.push(['beginAttributeValue', '"'])
        output.push(['attributeData', value])
        output.push(['finishAttributeValue', '"'])
      }
    } else {
      output.push(token)
    }
  })
  return output
}

const stringify = (tokens) => {
  return tokens.map(([type, value]) => value).join('')
}

class Transpiler {
  transpile (source) {
    const tokens = tokenize(source)
    return stringify(transform(tokens))
  }
}

module.exports = Transpiler
