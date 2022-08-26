const { extname } = require('path')

function getExtension (value) {
  return extname(value).slice(1)
}

function getBase64Extension (extension) {
  extension = extension && extension.toLowerCase()
  return extension === 'svg' ? 'svg+xml' : extension
}

module.exports = {
  getExtension,
  getBase64Extension
}
