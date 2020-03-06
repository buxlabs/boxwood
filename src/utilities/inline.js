const { isCurlyTag } = require('./string')
const { normalize } = require('./array')

function inlineAttributesInIfStatement (leaf, localVariables) {
  // TODO we should handle elseif, unless etc.
  if (leaf.tagName === 'if') {
    const normalizedAttributes = normalize(leaf.attributes)
    leaf.attributes = normalizedAttributes.map(attr => {
      // TODO handle or remove words to numbers functionality
      if (attr.type === 'Identifier' && !isCurlyTag(attr.key)) {
        const variable = localVariables && localVariables.find(variable => variable.key === attr.key)
        if (variable && isCurlyTag(variable.value)) {
          attr.key = `${variable.value}`
        } else {
          attr.key = `{${attr.key}}`
        }
      }
      return attr
    })
  }
}

module.exports = { inlineAttributesInIfStatement }
