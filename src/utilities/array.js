'use strict'

function isBoolean (string) {
  return string === 'true' || string === 'false'
}

function normalize (array) {
  if (array.length === 1) {
    const item = array[0]
    if (isBoolean(item.key)) { item.key = `{${item.key}}` }
  }

  return array.map(attribute => {
    attribute.type = 'Identifier'
    return attribute
  })
}

module.exports = { normalize }
