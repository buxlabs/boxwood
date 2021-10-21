'use strict'

const { extname } = require('path')
const lexer = require('./lexer')
const stringHash = require('string-hash')

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

function getOptimizedValue (value, compact) {
  if (typeof compact === 'function') { return compact(value) }
  if (compact === 'collapsed') { return value.trim().replace(/\n/g, '') }
  return compact ? value.replace(/\s+/g, ' ') : value
}

function extract (value, compact) {
  // is this the best way? should the lexer handle it?
  if (isSquareTag(value)) { return [{ type: 'expression', value }] }
  const text = getOptimizedValue(value, compact)
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

function isImportTag (name) {
  return name === 'import' || name === 'require'
}

function isPartialTag (name) {
  return name === 'partial' || name === 'include' || name === 'render'
}

function getExtension (value) {
  return extname(value).slice(1)
}

function getBase64Extension (extension) {
  extension = extension && extension.toLowerCase()
  return extension === 'svg' ? 'svg+xml' : extension
}

function dasherize (string) {
  return string.replace(/\./g, '-')
}

function hyphenate (string) {
  return string.replace(/([A-Z])/g, character => {
    return '-' + character.toLowerCase()
  })
}

function normalizeNewline (string) {
  return string.replace(/\r\n/g, '\n')
}

const WORDS = [
  'zero', 'one', 'two', 'three', 'four', 'five',
  'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen',
  'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'
]

function wordsToNumbers (string) {
  const index = WORDS.indexOf(string)
  if (index >= 0) { return index }
}

function hash (string) {
  if (!string) { return '' }
  return 's' + stringHash(string).toString(16)
}

module.exports = {
  extract,
  extractValues,
  isCurlyTag,
  isSquareTag,
  containsCurlyTag,
  getTagValue,
  curlyTag,
  isImportTag,
  isPartialTag,
  getExtension,
  getBase64Extension,
  dasherize,
  hyphenate,
  wordsToNumbers,
  normalizeNewline,
  hash
}
