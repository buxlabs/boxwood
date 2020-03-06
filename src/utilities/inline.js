const { isCurlyTag } = require('./string')
const { normalize } = require('./array')

const CONDITION_TAGS = ['if', 'elseif', 'unless', 'elseunless']

function inlineAttributesInIfStatement (node, localVariables, remove) {
  // TODO we should handle switch etc.
  if (CONDITION_TAGS.includes(node.tagName)) {
    const normalizedAttributes = normalize(node.attributes)
    node.attributes = normalizedAttributes.map(attr => {
      // TODO handle or remove words to numbers functionality
      if (attr.type === 'Identifier' && !isCurlyTag(attr.key)) {
        const variable = localVariables && localVariables.find(variable => variable.key === attr.key)
        if (variable && isCurlyTag(variable.value)) {
          attr.key = `${variable.value}`
        } else if (!variable && remove) {
          attr.key = '{void(0)}'
        } else {
          attr.key = `{${attr.key}}`
        }
      }
      return attr
    })
  }
}

module.exports = { inlineAttributesInIfStatement }
