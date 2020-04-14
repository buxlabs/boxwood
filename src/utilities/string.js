'use strict'

const lexer = require('./lexer')

function curlyTag (string) {
  return `{${string}}`
}

function isTag (value, startTag, endTag) {
  return value && typeof value === 'string' && value.startsWith(startTag) && value.endsWith(endTag)
}

function containsTag (value, startTag, endTag) {
  return value && value.includes(startTag) && value.includes(endTag)
}

function isCurlyTag (value) {
  return isTag(value, '{', '}')
}

function isSquareTag (value) {
  return isTag(value, '[', ']')
}

function containsCurlyTag (value) {
  return containsTag(value, '{', '}')
}

function getTagValue (value) {
  return value.substring(1, value.length - 1).trim()
}

function extract (value, compact) {
  // is this the best way? should the lexer handle it?
  if (isSquareTag(value)) { return [{ type: 'expression', value }] }
  const text = compact ? value.trim().replace(/\n/g, '') : value
  const tokens = lexer(text)
  const objects = tokens.map((token, index) => {
    if (token.type === 'expression') {
      // TODO
      // what about {(foo || bar) | capitalize} ?
      if (token.value.includes('|') && !token.value.includes('||')) {
        const parts = token.value.split('|').map(string => string.trim())
        token.original = `{${token.value}}`
        token.value = `{${parts[0]}}`
        token.filters = parts.slice(1)
      } else {
        token.value = `{${token.value}}`
      }
    }
    return token
  })
  return objects.filter(object => !!object.value)
}

function extractValues (attribute) {
  return extract(attribute.value)
    .reduce((values, { value }) => {
      if (isCurlyTag(value)) {
        values.push(value.trim())
      } else if (isSquareTag(value)) {
        values.push(value.trim())
      } else {
        const parts = value.split(/\s+/g)
        parts.forEach(part => values.push(part))
      }
      return values
    }, [])
}

function getName (name) {
  if (name.endsWith('|bind')) {
    return name.substring(0, name.length - 5)
  }
  return name
}

function isImportTag (name) {
  return name === 'import' || name === 'require'
}

function isPartialTag (name) {
  return name === 'partial' || name === 'include' || name === 'render'
}

function getExtension (value) {
  const parts = value.split('.')
  return parts[parts.length - 1]
}

function getBase64Extension (extension) {
  extension = extension && extension.toLowerCase()
  return extension === 'svg' ? 'svg+xml' : extension
}

module.exports = { extract, extractValues, getName, isCurlyTag, isSquareTag, containsCurlyTag, getTagValue, curlyTag, isImportTag, isPartialTag, getExtension, getBase64Extension }
