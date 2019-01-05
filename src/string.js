const { string: { singlespace } } = require('pure-utilities')

function isCurlyTag (value) {
  return value.startsWith('{') && value.endsWith('}')
}

function getExpressionFromCurlyTag (value) {
  return value.substring(1, value.length - 1)
}

function extract (value) {
  let objects = []
  let string = ''
  let depth = 0
  singlespace(value.trim()).split('').forEach(character => {
    if (character === '{') {
      depth++
      if (string && depth === 1) {
        objects.push({ value: string })
        string = ''
      }
    }
    string += character
    if (character === '}') {
      if (depth === 1) {
        objects.push({ value: string })
        string = ''
      }
      depth--
    }
  })
  objects.push({ value: string })
  objects = objects.map(object => {
    let value = object.value
    if (value.startsWith('{') && value.endsWith('}')) {
      if (value.includes('|') && !value.includes('||')) {
        value = value.substring(1, value.length - 1)
        let parts = value.split('|').map(string => string.trim())
        object.value = `{${parts[0]}}`
        object.filters = parts.slice(1)
      }
    }
    return object
  })
  return objects.filter(object => !!object.value)
}

function getName (name) {
  if (name.endsWith('.bind')) {
    return name.substring(0, name.length - 5)
  }
  return name
}

module.exports = {extract, getName, isCurlyTag, getExpressionFromCurlyTag}
