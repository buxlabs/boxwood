const negate = require('negate-sentence')
let { STANDARD_ACTIONS } = require('./action')

STANDARD_ACTIONS = STANDARD_ACTIONS.map(action => {
  return action.name.split('_')
})

const NEGATED_ACTIONS = STANDARD_ACTIONS.map(action => negate(action.join(' ')).split(' '))
const ACTIONS = STANDARD_ACTIONS.concat(NEGATED_ACTIONS)

function normalize (array) {
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
  return result
}

module.exports = { normalize }
