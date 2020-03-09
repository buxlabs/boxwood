const { isCurlyTag, getTagValue } = require('./string')
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

function inlineLocalVariablesInFragment (node, variables) {
  if (node.type === 'text') {
    variables.forEach(variable => {
      if (!isCurlyTag(variable.value)) {
        node.content = node.content.replace(new RegExp(`{${variable.key}}`, 'g'), variable.value)
      }
    })
  }
  if (node.attributes && node.attributes.length > 0) {
    node.attributes.forEach(attribute => {
      if (isCurlyTag(attribute.key)) {
        const key = getTagValue(attribute.key)
        const variable = variables.find(localVariable => {
          return localVariable.key === key
        })
        if (variable) {
          attribute.key = variable.key
          attribute.value = variable.value
        }
      }
    })
  }
}

module.exports = {
  inlineAttributesInIfStatement,
  inlineLocalVariablesInFragment
}
