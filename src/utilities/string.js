const { extname } = require('path')
const stringHash = require('string-hash')

function getExtension (value) {
  return extname(value).slice(1)
}

function getBase64Extension (extension) {
  extension = extension && extension.toLowerCase()
  return extension === 'svg' ? 'svg+xml' : extension
}

function hash (string) {
  if (!string) { return '' }
  return 's' + stringHash(string).toString(16)
}

module.exports = {
  getExtension,
  getBase64Extension,
  hash
}
