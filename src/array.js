const { flatten } = require('pure-utilities/collection')
const { unique } = require('pure-utilities/array')
const negate = require('negate-sentence')
let { STANDARD_ACTIONS } = require('./action')

STANDARD_ACTIONS = STANDARD_ACTIONS.map(action => {
  return action.name.split('_')
})

const NEGATED_ACTIONS = STANDARD_ACTIONS.map(action => negate(action.join(' ')).split(' '))
const ACTIONS = STANDARD_ACTIONS.concat(NEGATED_ACTIONS)
const ACTIONS_KEYWORDS_DICTIONARY = unique(flatten([...ACTIONS]))

function normalize (array, warnings) {
  const result = []
  let index
  for (let i = 0, ilen = array.length; i < ilen; i++) {
    let attribute = array[i]
    let found = false
    index = i
    for (let j = 0, jlen = ACTIONS.length; j < jlen; j++) {
      let action = ACTIONS[j]
      if (action[0] !== attribute.key) continue
      if (action.length === 1) {
        attribute.type = 'Action'
        result.push(attribute)
        found = true
        break
      }
      i++
      attribute = array[i]
      for (let k = 1, klen = action.length; k < klen; k++) {
        let part = action[k]
        if (part !== attribute.key) {
          i = index
          attribute = array[i]
          break
        }
        if (k === klen - 1) {
          result.push({ key: action.join('_'), value: attribute.value, type: 'Action' })
          found = true
        } else {
          i++
          attribute = array[i]
        }
      }
      if (found) break
    }
    if (!found) {
      attribute.type = attribute.key === 'not' ? 'Action' : 'Identifier'
      result.push(attribute)
    }
  }
  if (isInvalidAction(result)) {
    const action = result.reduce((accumulator, currentValue, index) => {
      accumulator += index === result.length - 1 ? currentValue.key : currentValue.key.concat(' ')
      return accumulator
    }, '')
    warnings.push({ message: `Invalid action name: ${action}`, type: 'INVALID_ACTION' })
  }
  return result
}

function isInvalidAction (attributes) {
  const keys = attributes.map(attribute => attribute.key)
  return !attributes.find(attribute => attribute.type === 'Action') &&
    ACTIONS_KEYWORDS_DICTIONARY.find(keyword => keys.includes(keyword))
}

module.exports = { normalize }
