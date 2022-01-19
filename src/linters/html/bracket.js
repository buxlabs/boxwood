const tokenize = require('../../lexers/html')

const OPENING_ANGLE_BRACKET = '<'
const CLOSING_ANGLE_BRACKET = '>'

function isOpeningBracket (character) {
  return character === OPENING_ANGLE_BRACKET
}

function isClosingBracket (character) {
  return character === CLOSING_ANGLE_BRACKET
}

function verifyBrackets (source) {
  const tokens = tokenize(source).filter(token => token[0] !== 'rawtext')
  const text = tokens.map(token => token[1]).join('')

  const errors = []
  let bracket = null
  for (const character of text) {
    if (isOpeningBracket(character)) {
      if (isOpeningBracket(bracket)) {
        errors.push({ type: 'CLOSING_ANGLE_BRACKET_MISSING', message: 'closing angle bracket is missing' })
      }
      bracket = OPENING_ANGLE_BRACKET
    } else if (isClosingBracket(character)) {
      if (!isOpeningBracket(bracket)) {
        errors.push({ type: 'OPENING_ANGLE_BRACKET_MISSING', message: 'opening angle bracket is missing' })
      }
      bracket = CLOSING_ANGLE_BRACKET
    }
  }
  return errors
}

module.exports = { verifyBrackets }
