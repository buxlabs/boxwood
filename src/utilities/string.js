'use strict'

const { extname } = require('path')
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

function containsCurlyTag (value) {
  return containsTag(value, '{', '}')
}

function getTagValue (value) {
  return value.substring(1, value.length - 1).trim()
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
  isCurlyTag,
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
