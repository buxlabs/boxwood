const { RESERVED_KEYWORDS } = require('./enum')

function placeholderName (keyword) {
  return `__${keyword.toUpperCase()}_PLACEHOLDER__`
}

function addPlaceholders (string) {
  RESERVED_KEYWORDS.forEach(keyword => {
    string = string.replace(new RegExp(`\\b${keyword}\\b`, 'g'), placeholderName(keyword))
  })
  return string
}

module.exports = {
  placeholderName,
  addPlaceholders
}
