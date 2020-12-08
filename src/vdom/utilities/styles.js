'use strict'

function styles (input) {
  if (typeof input === 'string') {
    return input
  }
  const result = []
  for (const key in input) {
    if (Object.prototype.hasOwnProperty.call(input, key)) {
      const value = input[key]
      result.push(`${key}: ${value}`)
    }
  }
  return result.join('; ')
}

module.exports = styles
