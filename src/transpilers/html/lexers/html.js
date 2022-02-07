'use strict'

const TEXT = 'text'
const CURLY = 'curly'
const SQUARE = 'square'

const CURLY_START_TAG = '{'
const CURLY_END_TAG = '}'

const SQUARE_START_TAG = '['
const SQUARE_END_TAG = ']'

module.exports = function tokenize (input) {
  const tokens = []
  const length = input.length
  let index = 0
  let character = input[0]
  function advance () {
    index += 1
    character = input[index]
    return character
  }
  function current (tag) {
    return character === tag
  }
  function push (type, value) {
    if (value) tokens.push({ type, value })
  }
  let value = ''
  let type = current(CURLY_START_TAG) ? CURLY : current(SQUARE_START_TAG) ? SQUARE : TEXT
  let depth = 0
  while (index < length) {
    if (current(CURLY_START_TAG)) { depth += 1 } else if (current(CURLY_END_TAG)) { depth -= 1 }
    if (current(SQUARE_START_TAG)) { depth += 1 } else if (current(SQUARE_END_TAG)) { depth -= 1 }

    if (current(CURLY_START_TAG) && depth === 1) {
      push(type, value)
      advance()
      value = ''
      type = CURLY
    } else if (current(CURLY_END_TAG) && depth === 0) {
      push(type, value)
      advance()
      value = ''
      type = TEXT
    } else if (current(SQUARE_START_TAG) && depth === 1) {
      push(type, value)
      advance()
      value = ''
      type = SQUARE
    } else if (current(SQUARE_END_TAG) && depth === 0) {
      push(type, value)
      advance()
      value = ''
      type = TEXT
    } else {
      value += character
      advance()
    }
  }
  push(type, value)

  return tokens
}
