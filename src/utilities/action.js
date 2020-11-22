'use strict'

const {
  parse,
  replace,
  first,
  walk,
  negationOperatorRemoval
} = require('abstract-syntax-tree')
const conditions = require('pure-conditions')
const negate = require('negate-sentence')
const isEqual = require('../conditions/isEqual')
const { clone } = require('./object')

function transform (handler) {
  const fn = handler.toString()
  const source = fn.startsWith('function ') ? fn : `function ${fn}`
  const tree = parse(source)
  return function (...args) {
    const method = first(tree, 'FunctionDeclaration')
    const body = clone(method.body.body)
    const params = method.params.map(param => param.name)

    function enter (leaf) {
      const index = params.indexOf(leaf.name)
      if (leaf.type === 'Identifier' && index >= 0 && !leaf.replaced) {
        walk(args[index], node => {
          node.replaced = true
        })
        return args[index]
      }
      return leaf
    }

    // TODO if the arguments that are passed are only literals
    // then in some cases we could evaluate the code at compile time
    // example:
    // {[1, 2, 3] | max}
    // {"hello" | capitalize}

    if (body.length === 1) {
      const { argument } = body[0]
      replace(argument, { enter })
      return argument
    } else {
      replace({ type: 'BlockStatement', body }, { enter })
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

function negateAction (argument) {
  return negationOperatorRemoval({ type: 'UnaryExpression', operator: '!', prefix: true, argument })
}

const STANDARD_ACTIONS = [
  { name: 'not', handler: negateAction, args: 1 },
  { name: 'is_positive', handler: transform(conditions.isPositive), args: 1 },
  { name: 'is_negative', handler: transform(conditions.isNegative), args: 1 },
  { name: 'is_finite', handler: transform(conditions.isFinite), args: 1 },
  { name: 'is_infinite', handler: transform(conditions.isInfinite), args: 1 },
  { name: 'is_present', handler: transform(conditions.isPresent), args: 1 },
  { name: 'is_alpha', handler: transform(conditions.isAlpha), args: 1 },
  { name: 'is_alphanumeric', handler: transform(conditions.isAlphaNumeric), args: 1 },
  { name: 'are_present', handler: transform(conditions.isPresent), args: 1 },
  { name: 'is_empty', handler: transform(conditions.isEmpty), args: 1 },
  { name: 'are_empty', handler: transform(conditions.isEmpty), args: 1 },
  { name: 'is_null', handler: transform(conditions.isNull), args: 1 },
  { name: 'is_undefined', handler: transform(conditions.isUndefined), args: 1 },
  { name: 'is_void', handler: transform(conditions.isUndefined), args: 1 },
  { name: 'is_even', handler: transform(conditions.isEven), args: 1 },
  { name: 'is_odd', handler: transform(conditions.isOdd), args: 1 },
  { name: 'is_numeric', handler: transform(conditions.isNumeric), args: 1 },
  { name: 'is_an_array', handler: transform(conditions.isArray), args: 1 },
  { name: 'is_an_object', handler: transform(conditions.isObject), args: 1 },
  { name: 'is_frozen', handler: transform(conditions.isFrozen), args: 1 },
  { name: 'is_sealed', handler: transform(conditions.isSealed), args: 1 },
  { name: 'is_a_regexp', handler: transform(conditions.isRegExp), args: 1 },
  { name: 'is_a_regex', handler: transform(conditions.isRegExp), args: 1 },
  { name: 'is_a_number', handler: transform(conditions.isNumber), args: 1 },
  { name: 'is_a_multiple_of', handler: transform(conditions.isMultiple), args: 2 },
  { name: 'is_a_digit', handler: transform(conditions.isDigit), args: 1 },
  { name: 'is_decimal', handler: transform(conditions.isDecimal), args: 1 },
  { name: 'is_a_string', handler: transform(conditions.isString), args: 1 },
  { name: 'is_a_symbol', handler: transform(conditions.isSymbol), args: 1 },
  { name: 'is_a_map', handler: transform(conditions.isMap), args: 1 },
  { name: 'is_a_weakmap', handler: transform(conditions.isWeakMap), args: 1 },
  { name: 'is_a_set', handler: transform(conditions.isSet), args: 1 },
  { name: 'is_a_weakset', handler: transform(conditions.isWeakSet), args: 1 },
  { name: 'is_a_boolean', handler: transform(conditions.isBoolean), args: 1 },
  { name: 'is_a_date', handler: transform(conditions.isDate), args: 1 },
  { name: 'is_true', handler: transform(conditions.isTruthy), args: 1 },
  { name: 'is_false', handler: transform(conditions.isFalsy), args: 1 },
  { name: 'is_truthy', handler: transform(conditions.isTruthy), args: 1 },
  { name: 'is_falsy', handler: transform(conditions.isFalsy), args: 1 },
  { name: 'is_divisible_by', handler: transform(conditions.isDivisible), args: 2 },
  { name: 'is_prime', handler: transform(conditions.isPrime), args: 1 },
  { name: 'is_a_palindrome', handler: transform(conditions.isPalindrome), args: 1 },
  { name: 'is_sooner_than', handler: transform(conditions.isSoonerThan), args: 2 },
  { name: 'is_before', handler: transform(conditions.isSoonerThan), args: 2 },
  { name: 'is_later_than', handler: transform(conditions.isLaterThan), args: 2 },
  { name: 'is_after', handler: transform(conditions.isLaterThan), args: 2 },
  { name: 'responds_to', handler: transform(conditions.respondsTo), args: 2 },
  { name: 'starts_with', handler: transform(conditions.startsWith), args: 2 },
  { name: 'ends_with', handler: transform(conditions.endsWith), args: 2 },
  { name: 'has_a_whitespace', handler: transform(conditions.hasWhitespace), args: 1 },
  { name: 'has_a_newline', handler: transform(conditions.hasNewLine), args: 1 },
  { name: 'has_a_number', handler: transform(conditions.hasNumber), args: 1 },
  { name: 'has_numbers', handler: transform(conditions.hasNumbers), args: 1 },
  { name: 'or', handler: transform(conditions.isAlternative), args: 2 },
  { name: 'xor', handler: transform(conditions.isExclusiveAlternative), args: 2 },
  { name: 'and', handler: transform(conditions.isConjunction), args: 2 },
  { name: 'eq', handler: transform(isEqual), args: 2 },
  { name: 'gt', handler: transform(conditions.isGreaterThan), args: 2 },
  { name: 'is_different_than', handler: transform(conditions.notEqual), args: 2 },
  { name: 'is_equal_to', handler: transform(isEqual), args: 2 },
  { name: 'is_greater_than_or_equals', handler: transform(conditions.isGreaterThanOrEqual), args: 2 },
  { name: 'is_greater_than', handler: transform(conditions.isGreaterThan), args: 2 },
  { name: 'lt', handler: transform(conditions.isLessThan), args: 2 },
  { name: 'is_less_than_or_equals', handler: transform(conditions.isLessThanOrEqual), args: 2 },
  { name: 'is_less_than', handler: transform(conditions.isLessThan), args: 2 },
  { name: 'gte', handler: transform(conditions.isGreaterThanOrEqual), args: 2 },
  { name: 'lte', handler: transform(conditions.isLessThanOrEqual), args: 2 },
  { name: 'equals', handler: transform(isEqual), args: 2 },
  { name: 'includes', handler: transform(conditions.includes), args: 2 },
  { name: 'contains', handler: transform(conditions.includes), args: 2 },
  { name: 'matches', handler: transform(conditions.matches), args: 2 },
  { name: 'bitwise_or', handler: transform(conditions.isBitwiseAlternative), args: 2 },
  { name: 'bitwise_and', handler: transform(conditions.isBitwiseConjunction), args: 2 },
  { name: 'bitwise_xor', handler: transform(conditions.isBitwiseAlternativeNegation), args: 2 },
  { name: 'bitwise_not', handler: transform(conditions.isBitwiseNegation), args: 1 },
  { name: 'is_an_email', handler: transform(conditions.isEmail), args: 1 },
  { name: 'have_more_than', handler: transform(conditions.haveMoreThan), args: 2 },
  { name: 'have_less_than', handler: transform(conditions.haveLessThan), args: 2 },
  { name: 'have_many', handler: transform(conditions.haveMany), args: 1 },
  { name: 'is_at_most', handler: transform(conditions.isLessThanOrEqual), args: 2 },
  { name: 'has_length_of_at_least', handler: transform(conditions.hasLengthOfAtLeast), args: 2 },
  { name: 'has_length_of_at_most', handler: transform(conditions.hasLengthOfAtMost), args: 2 },
  { name: 'has_length_of', handler: transform(conditions.hasLengthOf), args: 2 },
  { name: 'is_type_of', handler: transform(conditions.hasTypeOf), args: 2 },
  { name: 'has_type_of', handler: transform(conditions.hasTypeOf), args: 2 },
  { name: 'have', handler: transform(conditions.have), args: 2 },
  { name: 'has_more_than', handler: transform(conditions.haveMoreThan), args: 2 },
  { name: 'has_less_than', handler: transform(conditions.haveLessThan), args: 2 },
  { name: 'has_many', handler: transform(conditions.haveMany), args: 1 },
  { name: 'has_an_extension_of', handler: transform(conditions.hasExtension), args: 2 },
  { name: 'has_any_keys', handler: transform(conditions.hasKeys), args: 1 },
  { name: 'has', handler: transform(conditions.have), args: 2 },
  { name: 'is_between', handler: transform(conditions.isBetween), args: 3 },
  { name: 'is_below', handler: transform(conditions.isLessThan), args: 2 },
  { name: 'is_above', handler: transform(conditions.isGreaterThan), args: 2 },
  { name: 'is_at_least', handler: transform(conditions.isGreaterThanOrEqual), args: 2 },
  { name: 'is_a_url', handler: transform(conditions.isUrl), args: 1 },
  { name: 'is_in', handler: transform(conditions.isIn), args: 2 },
  { name: 'is_defined', handler: transform(conditions.isPresent), args: 1 },
  { name: 'is_a_video', handler: transform(conditions.isVideo), args: 1 },
  { name: 'is_an_audio', handler: transform(conditions.isAudio), args: 1 },
  { name: 'is_an_image', handler: transform(conditions.isImage), args: 1 },
  { name: 'is_an_empty_array', handler: transform(conditions.isEmptyArray), args: 1 },
  { name: 'is_an_empty_string', handler: transform(conditions.isEmptyArray), args: 1 },
  { name: 'is_an_empty_object', handler: transform(conditions.isEmptyObject), args: 1 },
  { name: 'is_an_empty_set', handler: transform(conditions.isEmptySet), args: 1 },
  { name: 'is_an_empty_map', handler: transform(conditions.isEmptySet), args: 1 },
  { name: 'is_extensible', handler: transform(conditions.isExtensible), args: 1 },
  { name: 'is_an_error', handler: transform(conditions.isError), args: 1 },
  { name: 'is_nan', handler: transform(conditions.isNaN), args: 1 },
  { name: 'exists', handler: transform(conditions.exists), args: 1 },
  { name: 'is_missing', handler: transform(conditions.isMissing), args: 1 },
  { name: 'is_function', handler: transform(conditions.isFunction), args: 1 },
  { name: 'is_an_instance_of', handler: transform(conditions.isInstanceOf), args: 2 }
]
const NEGATED_ACTIONS = STANDARD_ACTIONS.map(action => {
  let { name } = action
  name = negate(name.replace(/_/g, ' ')).replace(/\s/g, '_')
  return {
    name,
    handler: function () {
      return negateAction(action.handler.apply(this, arguments))
    },
    args: action.args
  }
})

const ACTIONS = STANDARD_ACTIONS.concat(NEGATED_ACTIONS)

module.exports = {
  getAction (name) {
    for (const action of ACTIONS) {
      if (action.name === name) {
        return action
      }
    }
  },
  ACTIONS
}
