const AbstractSyntaxTree = require('abstract-syntax-tree')
const { getIdentifier, getLiteral } = require('./factory')
const { string: { singularize } } = require('pure-utilities')
const conditions = require('pure-conditions')

function getCondition (name) {
  return function (...args) {
    const source = 'function ' + conditions[name].toString()
    const tree = new AbstractSyntaxTree(source)
    const fn = tree.first('FunctionDeclaration')
    const { body } = fn.body
    const params = fn.params.map(param => param.name)
    if (body.length === 1) {
      const statement = body[0].argument
      AbstractSyntaxTree.replace(statement, leaf => {
        const index = params.indexOf(leaf.name)
        if (leaf.type === 'Identifier' && index >= 0) {
          return args[index]
        }
        return leaf
      })
      return statement
    } else {
      AbstractSyntaxTree.replace({ type: 'BlockStatement', body }, leaf => {
        const index = params.indexOf(leaf.name)
        if (leaf.type === 'Identifier' && index >= 0) {
          return args[index]
        }
        return leaf
      })
      return {
        type: 'CallExpression',
        callee: {
          type: 'FunctionExpression',
          generator: false,
          expression: false,
          params: [],
          body: {
            type: 'BlockStatement',
            body
          }
        },
        arguments: []
      }
    }
  }
}

function negate (argument) {
  return { type: 'UnaryExpression', operator: '!', prefix: true, argument }
}

const STANDARD_ACTIONS = [
  { name: 'not', handler: negate, args: 1 },
  { name: 'is_positive', handler: getCondition('isPositive'), args: 1 },
  { name: 'is_negative', handler: getCondition('isNegative'), args: 1 },
  { name: 'is_finite', handler: getCondition('isFinite'), args: 1 },
  { name: 'is_infinite', handler: getCondition('isInfinite'), args: 1 },
  { name: 'is_present', handler: getCondition('isPresent'), args: 1 },
  { name: 'is_alpha', handler: getCondition('isAlpha'), args: 1 },
  { name: 'is_alphanumeric', handler: getCondition('isAlphaNumeric'), args: 1 },
  { name: 'are_present', handler: getCondition('isPresent'), args: 1 },
  { name: 'is_empty', handler: getCondition('isEmpty'), args: 1 },
  { name: 'are_empty', handler: getCondition('isEmpty'), args: 1 },
  { name: 'is_null', handler: getCondition('isNull'), args: 1 },
  { name: 'is_undefined', handler: getCondition('isUndefined'), args: 1 },
  { name: 'is_void', handler: getCondition('isUndefined'), args: 1 },
  { name: 'is_even', handler: getCondition('isEven'), args: 1 },
  { name: 'is_odd', handler: getCondition('isOdd'), args: 1 },
  { name: 'is_numeric', handler: getCondition('isNumeric'), args: 1 },
  { name: 'is_an_array', handler: getCondition('isArray'), args: 1 },
  { name: 'is_an_object', handler: getCondition('isObject'), args: 1 },
  { name: 'is_frozen', handler: getCondition('isFrozen'), args: 1 },
  { name: 'is_sealed', handler: getCondition('isSealed'), args: 1 },
  { name: 'is_a_regexp', handler: getCondition('isRegExp'), args: 1 },
  { name: 'is_a_regex', handler: getCondition('isRegExp'), args: 1 },
  { name: 'is_a_number', handler: getCondition('isNumber'), args: 1 },
  { name: 'is_a_multiple_of', handler: getCondition('isMultiple'), args: 2 },
  { name: 'is_a_digit', handler: getCondition('isDigit'), args: 1 },
  { name: 'is_decimal', handler: getCondition('isDecimal'), args: 1 },
  { name: 'is_a_string', handler: getCondition('isString'), args: 1 },
  { name: 'is_a_symbol', handler: getCondition('isSymbol'), args: 1 },
  { name: 'is_a_map', handler: getCondition('isMap'), args: 1 },
  { name: 'is_a_weakmap', handler: getCondition('isWeakMap'), args: 1 },
  { name: 'is_a_set', handler: getCondition('isSet'), args: 1 },
  { name: 'is_a_weakset', handler: getCondition('isWeakSet'), args: 1 },
  { name: 'is_a_boolean', handler: getCondition('isBoolean'), args: 1 },
  { name: 'is_a_date', handler: getCondition('isDate'), args: 1 },
  { name: 'is_true', handler: getCondition('isTruthy'), args: 1 },
  { name: 'is_false', handler: getCondition('isFalsy'), args: 1 },
  { name: 'is_truthy', handler: getCondition('isTruthy'), args: 1 },
  { name: 'is_falsy', handler: getCondition('isFalsy'), args: 1 },
  { name: 'is_divisible_by', handler: getCondition('isDivisible'), args: 2 },
  { name: 'is_prime', handler: getCondition('isPrime'), args: 1 },
  { name: 'is_palindrome', handler: getCondition('isPalindrome'), args: 1 },
  { name: 'is_sooner_than', handler: getCondition('isSoonerThan'), args: 2 },
  { name: 'is_before', handler: getCondition('isSoonerThan'), args: 2 },
  { name: 'is_later_than', handler: getCondition('isLaterThan'), args: 2 },
  { name: 'is_after', handler: getCondition('isLaterThan'), args: 2 },
  { name: 'responds_to', handler: getCondition('respondsTo'), args: 2 },
  { name: 'starts_with', handler: getCondition('startsWith'), args: 2 },
  { name: 'ends_with', handler: getCondition('endsWith'), args: 2 },
  { name: 'has_a_whitespace', handler: getCondition('hasWhitespace'), args: 1 },
  { name: 'has_a_newline', handler: getCondition('hasNewLine'), args: 1 },
  { name: 'has_a_number', handler: getCondition('hasNumber'), args: 1 },
  { name: 'has_numbers', handler: getCondition('hasNumbers'), args: 1 },
  { name: 'or', handler: getCondition('isAlternative'), args: 2 },
  { name: 'xor', handler: getCondition('isExclusiveAlternative'), args: 2 },
  { name: 'and', handler: getCondition('isConjunction'), args: 2 },
  { name: 'eq', handler: getCondition('isEquals'), args: 2 },
  { name: 'is_different_than', handler: getCondition('notEqual'), args: 2 },
  { name: 'does_not_equal', handler: getCondition('notEqual'), args: 2 },
  { name: 'is_not_equal_to', handler: getCondition('notEqual'), args: 2 },
  { name: 'gt', handler: getCondition('isGreaterThan'), args: 2 },
  { name: 'is_greater_than', handler: getCondition('isGreaterThan'), args: 2 },
  { name: 'lt', handler: getCondition('isLessThan'), args: 2 },
  { name: 'is_less_than', handler: getCondition('isLessThan'), args: 2 },
  { name: 'gte', handler: getCondition('isGreaterThanOrEqual'), args: 2 },
  { name: 'is_greater_than_or_equals', handler: getCondition('isGreaterThanOrEqual'), args: 2 },
  { name: 'lte', handler: getCondition('isLessThanOrEqual'), args: 2 },
  { name: 'is_less_than_or_equals', handler: getCondition('isLessThanOrEqual'), args: 2 },
  { name: 'equals', handler: getCondition('isEquals'), args: 2 },
  { name: 'includes', handler: getCondition('includes'), args: 2 },
  { name: 'contains', handler: getCondition('includes'), args: 2 },
  { name: 'matches', handler: getCondition('matches'), args: 2 },
  { name: 'bitwise_or', handler: getCondition('isBitwiseAlternative'), args: 2 },
  { name: 'bitwise_and', handler: getCondition('isBitwiseConjunction'), args: 2 },
  { name: 'bitwise_xor', handler: getCondition('isBitwiseAlternativeNegation'), args: 2 },
  { name: 'bitwise_not', handler: getCondition('isBitwiseNegation'), args: 1 },
  { name: 'is_an_email', handler: getCondition('isEmail'), args: 1 },
  { name: 'have_more_than', handler: getCondition('haveMoreThan'), args: 2 },
  { name: 'have_less_than', handler: getCondition('haveLessThan'), args: 2 },
  { name: 'have_many', handler: getCondition('haveMany'), args: 1 },
  { name: 'have', handler: getCondition('have'), args: 2 },
  { name: 'has_more_than', handler: getCondition('haveMoreThan'), args: 2 },
  { name: 'has_less_than', handler: getCondition('haveLessThan'), args: 2 },
  { name: 'has_many', handler: getCondition('haveMany'), args: 1 },
  { name: 'has', handler: getCondition('have'), args: 2 },
  { name: 'is_between', handler: getCondition('isBetween'), args: 3 },
  { name: 'is_below', handler: getCondition('isLessThan'), args: 2 },
  { name: 'is_above', handler: getCondition('isGreaterThan'), args: 2 },
  { name: 'is_at_least', handler: getCondition('isGreaterThanOrEqual'), args: 2 },
  { name: 'is_at_most', handler: getCondition('isLessThanOrEqual'), args: 2 },
  { name: 'has_length_of', handler: getCondition('hasLengthOf'), args: 2 },
  { name: 'has_length_of_at_least', handler: getCondition('hasLengthOfAtLeast'), args: 2 },
  { name: 'has_length_of_at_most', handler: getCondition('hasLengthOfAtMost'), args: 2 },
  { name: 'is_a_url', handler: getCondition('isUrl'), args: 1 },
  { name: 'is_in', handler: getCondition('isIn'), args: 2 },
  { name: 'is_defined', handler: getCondition('isPresent'), args: 1 },
  { name: 'is_an_video', handler: getCondition('isVideo'), args: 1},
  { name: 'is_an_audio', handler: getCondition('isAudio'), args: 1},
  { name: 'is_an_image', handler: getCondition('isImage'), args: 1},
  { name: 'has_extension_of', handler: getCondition('hasExtension'), args: 2},
  { name: 'is_an_empty_array', handler: getCondition('isEmptyArray'), args: 1},
  { name: 'is_an_empty_string', handler: getCondition('isEmptyArray'), args: 1},
  { name: 'is_an_empty_object', handler: getCondition('isEmptyObject'), args: 1},
  { name: 'is_an_empty_set', handler: getCondition('isEmptySet'), args: 1},
  { name: 'is_an_empty_map', handler: getCondition('isEmptySet'), args: 1}
]
const NEGATED_ACTIONS = STANDARD_ACTIONS.map(action => {
  let { name } = action
  if (name.includes('has')) {
    name = 'does_not_have_' + name.substring(4)
    if (name[name.length - 1] === '_') name = name.slice(0, -1)
  } else if (name.includes('have')) {
    name = 'do_not_' + name
  } else if (name.includes('with')) {
    const index = name.indexOf('_with')
    name = 'does_not_' + singularize(name.substr(0, index)) + name.substr(index)
  } else if (name === 'or') {
    name = 'nor'
  } else if (name === 'and') {
    name = 'nand'
  } else if (name === 'eq') {
    name = 'neq'
  } else if (name === 'responds_to') {
    name = 'does_not_respond_to'
  } else if (name === 'matches') {
    name = 'does_not_match'
  } else if (name === 'contains') {
    name = 'does_not_contain'
  } else if (name === 'inlcudes') {
    name = 'does_not_include'
  } else {
    let temp = name.split('_')
    temp.splice(1, 0, 'not')
    name = temp.join('_')
  }
  return {
    name,
    handler: function () {
      return negate(action.handler.apply(this, arguments))
    },
    args: action.args
  }
})

const ACTIONS = STANDARD_ACTIONS.concat(NEGATED_ACTIONS)

module.exports = {
  getAction (name) {
    for (let action of ACTIONS) {
      if (action.name === name) {
        return action
      }
    }
  }
}
