'use strict'

function styles (object) {
  const result = []
  for (const key in object) {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      const value = object[key]
      result.push(`${key}: ${value}`)
    }
  }
  return result.join('; ')
}

module.exports = styles
