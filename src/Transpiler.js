'use strict'

const Lexer = require('html-lexer')
const { isCurlyTag, getTagValue } = require('./utilities/string')
const { SPECIAL_TAGS } = require('./utilities/enum')

const tokenize = (source) => {
  const tokens = []
  const delegate = {
    write: (token) => tokens.push(token),
    end: () => null
  }
  const lexer = new Lexer(delegate)
  lexer.write(source)
  lexer.end()
  return tokens
}

const transform = (tokens) => {
  const output = []
  const contexts = []
  const imports = []
  let lastTag
  tokens.forEach((token, index) => {
    const [type, value] = token
    const next = tokens[index + 1]
    if (type === 'tagName') {
      lastTag = value
      if (value === 'if' || value === 'unless') {
        contexts.push(value)
      } else if (value === 'elseif' || value === 'else' || value === 'elseunless') {
        const context = contexts[contexts.length - 1]
        if (context === 'if' || context === 'elseif' || context === 'unless') {
          const last = output.pop()
          output.push(['beginEndTag', '</'])
          output.push(['tagName', context])
          output.push(['finishTag', '>'])
          output.push(last)
          contexts.push(value)
        }
      } else if (value === 'end') {
        const context = contexts[contexts.length - 1]
        if (context === 'if' || context === 'unless' || context === 'elseunless' || context === 'else' || context === 'elseif') {
          tokens[index - 1][0] = 'beginEndTag'
          tokens[index - 1][1] = '</'
          token[1] = context
          contexts.pop()
        }
      }
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
