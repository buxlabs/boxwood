const { string: { singularize } } = require('pure-utilities')

/*Tne order of actions is important.
  Actions With shorten names can override longer actions containing the same words.
*/
const STANDARD_ACTIONS = [
  ['is', 'positive'],
  ['is', 'negative'],
  ['is', 'finite'],
  ['is', 'infinite'],
  ['is', 'present'],
  ['are', 'present'],
  ['is', 'empty'],
  ['are', 'empty'],
  ['is', 'null'],
  ['is', 'undefined'],
  ['is', 'void'],
  ['is', 'even'],
  ['is', 'odd'],
  ['is', 'alpha'],
  ['is', 'alphanumeric'],
  ['is', 'numeric'],
  ['is', 'an', 'array'],
  ['is', 'an', 'object'],
  ['is', 'frozen'],
  ['is', 'sealed'],
  ['is', 'a', 'regexp'],
  ['is', 'a', 'regex'],
  ['is', 'a', 'number'],
  ['is', 'a', 'multiple', 'of'],
  ['is', 'a', 'digit'],
  ['is', 'decimal'],
  ['is', 'a', 'string'],
  ['is', 'a', 'symbol'],
  ['is', 'a', 'map'],
  ['is', 'a', 'weakmap'],
  ['is', 'a', 'set'],
  ['is', 'a', 'weakset'],
  ['is', 'a', 'boolean'],
  ['is', 'a', 'date'],
  ['is', 'an', 'email'],
  ['is', 'true'],
  ['is', 'false'],
  ['is', 'truthy'],
  ['is', 'falsy'],
  ['is', 'divisible', 'by'],
  ['is', 'prime'],
  ['is', 'palindrome'],
  ['is', 'sooner', 'than'],
  ['is', 'before'],
  ['is', 'later', 'than'],
  ['is', 'after'],
  ['responds', 'to'],
  ['starts', 'with'],
  ['ends', 'with'],
  ['has', 'a', 'whitespace'],
  ['has', 'a', 'newline'],
  ['has', 'a', 'number'],
  ['has', 'numbers'],
  ['or'],
  ['and'],
  ['eq'],
  ['neq'],
  ['is', 'different', 'than'],
  ['does', 'not', 'equal'],
  ['is', 'not', 'equal', 'to'],
  ['gt'],
  ['is', 'greater', 'than', 'or', 'equals'],
  ['is', 'greater', 'than'],
  ['lt'],
  ['is', 'less', 'than', 'or', 'equals'],
  ['is', 'less', 'than'],
  ['gte'],
  ['lte'],
  ['equals'],
  ['includes'],
  ['contains'],
  ['matches'],
  ['bitwise', 'or'],
  ['bitwise', 'and'],
  ['bitwise', 'xor'],
  ['bitwise', 'not'],
  ['have', 'more', 'than'],
  ['have', 'less', 'than'],
  ['have', 'many'],
  ['have'],
  ['has', 'more', 'than'],
  ['has', 'less', 'than'],
  ['has', 'many'],
  ['is', 'between'],
  ['is', 'below'],
  ['is', 'above'],
  ['is', 'at', 'least'],
  ['is', 'at', 'most'],
  ['is', 'in'],
  ['has', 'length', 'of', 'at', 'least'],
  ['has', 'length', 'of', 'at', 'most'],
  ['has', 'length', 'of'],
  ['has', 'extension', 'of'],
  ['has'],
  ['is', 'a', 'url'],
  ['xor'],
  ['is', 'defined'],
  ['is', 'an', 'video'],
  ['is', 'an', 'audio'],
  ['is', 'an', 'image'],
  ['is', 'an', 'empty', 'array'],
  ['is', 'an', 'empty', 'string'],
  ['is', 'an', 'empty', 'object'],
  ['is', 'an', 'empty', 'set'],
  ['is', 'an', 'empty', 'map'],
]

const NEGATED_ACTIONS = STANDARD_ACTIONS.map(action => {
  if (action[0] === 'has') {
    return ['does', 'not', 'have'].concat(action.slice(1))
  } else if (action[0] === 'have') {
    return ['do', 'not'].concat(action)
  } else if (action[1] === 'with') {
    return ['does', 'not'].concat(singularize(action[0]), action[1])
  } else if (action[0] === 'or') {
    return ['nor']
  } else if (action[0] === 'and') {
    return ['nand']
  } else if (action[0] === 'responds') {
    return ['does', 'not', 'respond', 'to']
  } else if (action[0] === 'matches') {
    return ['does', 'not', 'match']
  } else if (action[0] === 'contains') {
    return ['does', 'not', 'contain']
  } else if (action[0] === 'includes') {
    return ['does', 'not', 'include']
  } else {
    let array = action.slice(0)
    array.splice(1, 0, 'not')
    return array
  }
})

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
