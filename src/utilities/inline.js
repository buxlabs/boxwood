const AbstractSyntaxTree = require('abstract-syntax-tree')
const { extract, isCurlyTag, isSquareTag, getTagValue } = require('./string')
const { addPlaceholders, placeholderName } = require('./keywords')
const { convertToExpression } = require('./convert')
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
      } else if (isCurlyTag(attribute.value)) {
        const key = getTagValue(attribute.value)
        const variable = variables.find(localVariable => {
          return localVariable.key === key
        })
        if (variable) {
          attribute.value = variable.value
        }
      }
    })
  }
}

function inlineExpressions (leaf, localVariables) {
  if (localVariables.length === 0) { return null }
  if (leaf.attributes) {
    leaf.attributes.forEach(attr => {
      const { key, value } = attr
      function inlineExpression (type, attr, string) {
        if (!string) return
        const parts = extract(string)
        const result = parts.reduce((accumulator, node) => {
          const { value } = node
          if (node.type === 'text' && !isSquareTag(value)) {
            return accumulator + value
          }
          const input = isSquareTag(value) ? value : getTagValue(value)
          if (isCurlyTag(input)) { return accumulator + value }
          const source = addPlaceholders(input)
          const ast = new AbstractSyntaxTree(source)
          let replaced = false
          ast.replace({
            enter: (node, parent) => {
              // TODO investigate
              // this is too optimistic
              if (node.type === 'Identifier' && (!parent || parent.type !== 'MemberExpression')) {
                const variable = localVariables.find(variable => variable.key === node.name || placeholderName(variable.key) === node.name)
                if (variable) {
                  replaced = true
                  if (isCurlyTag(variable.value)) {
                    return convertToExpression(getTagValue(variable.value))
                  }
                  return { type: 'Literal', value: variable.value }
                }
              }
              return node
            }
          })
          if (replaced) {
            if (isSquareTag(value)) {
              return accumulator + ast.source.replace(/;\n$/, '')
            }
            return accumulator + '{' + ast.source.replace(/;\n$/, '') + '}'
          } else if (node.filters && node.filters.length > 0) {
            return accumulator + node.original
          }
          return accumulator + value
        }, '')
        attr[type] = result
      }

      inlineExpression('key', attr, key)
      inlineExpression('value', attr, value)
    })
  }
}

module.exports = {
  inlineAttributesInIfStatement,
  inlineLocalVariablesInFragment,
  inlineExpressions
}
