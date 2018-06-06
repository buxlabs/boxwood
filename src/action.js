const AbstractSyntaxTree = require('abstract-syntax-tree')
const { getIdentifier, getLiteral } = require('./factory')
const { string: { singularize } } = require('pure-utilities')
const conditions = require('pure-conditions')

function getCondition (name) {
  return function (node) {
    const source = 'function ' + conditions[name].toString()
    const tree = new AbstractSyntaxTree(source)
    const fn = tree.first('FunctionDeclaration')
    const param = fn.params[0]
    const body = tree.first('ReturnStatement').argument
    AbstractSyntaxTree.replace(body, leaf => {
      if (leaf.type === 'Identifier' && leaf.name === param.name) {
        return node
      }
      return leaf
    })
    return body
  }
}

function isEmpty (node) {
  const code = AbstractSyntaxTree.generate(node)
  const tree = new AbstractSyntaxTree(`
      ${code} == null || (Array.isArray(${code}) || Object.prototype.toString.call(${code}) === '[object String]') && ${code}.length === 0 ||
      (Object.prototype.toString.call(${code}) === '[object Set]' ||
       Object.prototype.toString.call(${code}) === '[object Map]') && ${code}.size === 0 ||
      (Object.prototype.toString.call(${code}) === '[object Object]' ||
       Object.prototype.toString.call(${code}) === '[object Function]') && Object.keys(${code}).length === 0
    `)

  return tree.first('LogicalExpression')
}

function isObject (node) {
  return {
    type: 'LogicalExpression',
    left: {
      type: 'LogicalExpression',
      left: {
        type: 'BinaryExpression',
        left: {
          type: 'UnaryExpression',
          operator: 'typeof',
          prefix: true,
          argument: node
        },
        operator: '===',
        right: getLiteral('function')
      },
      operator: '||',
      right: {
        type: 'BinaryExpression',
        left: {
          type: 'UnaryExpression',
          operator: 'typeof',
          prefix: true,
          argument: node
        },
        operator: '===',
        right: getLiteral('object')
      }
    },
    operator: '&&',
    right: {
      type: 'UnaryExpression',
      operator: '!',
      prefix: true,
      argument: {
        type: 'UnaryExpression',
        operator: '!',
        prefix: true,
        argument: node
      }
    }
  }
}

function isMultiple (left, right) {
  return {
    type: 'BinaryExpression',
    left: {
      type: 'BinaryExpression',
      left,
      operator: '%',
      right
    },
    operator: '===',
    right: {
      type: 'Literal',
      value: 0
    }
  }
}

function isNumeric (node) {
  const code = AbstractSyntaxTree.generate(node)
  const tree = new AbstractSyntaxTree(`
    (typeof ${code} === 'string' || typeof ${code} === 'number') && !isNaN(Number(${code}))
  `)
  return tree.first('LogicalExpression')
}

function negate (argument) {
  return { type: 'UnaryExpression', operator: '!', prefix: true, argument }
}

function getExpression (type, left, right, operator) {
  return { type, left, right, operator }
}

function getLogicalExpression (left, right, operator) {
  return getExpression('LogicalExpression', left, right, operator)
}

function getBinaryExpression (left, right, operator) {
  return getExpression('BinaryExpression', left, right, operator)
}

function isAlternative (left, right) {
  return getLogicalExpression(left, right, '||')
}

function isConjunction (left, right) {
  return getLogicalExpression(left, right, '&&')
}

function isGreaterThan (left, right) {
  return getLogicalExpression(left, right, '>')
}

function isLessThan (left, right) {
  return getLogicalExpression(left, right, '<')
}

function isGreaterThanOrEqual (left, right) {
  return getLogicalExpression(left, right, '>=')
}

function isLessThanOrEqual (left, right) {
  return getLogicalExpression(left, right, '<=')
}

function isEquals (left, right) {
  return getLogicalExpression(left, right, '===')
}

function includes (left, right) {
  return {
    type: 'BinaryExpression',
    left: {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: left,
        property: {
          type: 'Identifier',
          name: 'indexOf'
        },
        computed: false
      },
      arguments: [right]
    },
    operator: '!==',
    right: {
      type: 'UnaryExpression',
      operator: '-',
      prefix: true,
      argument: {
        type: 'Literal',
        value: 1
      }
    }
  }
}

function matches (left, right) {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: left,
      property: {
        type: 'Identifier',
        name: 'match'
      },
      computed: false
    },
    arguments: [right]
  }
}

function notEqual (left, right) {
  return getLogicalExpression(left, right, '!==')
}

function isBitwiseAlternative (left, right) {
  return getBinaryExpression(left, right, '|')
}

function isBitwiseConjunction (left, right) {
  return getBinaryExpression(left, right, '&')
}

function isBitwiseAlternativeNegation (left, right) {
  return getBinaryExpression(left, right, '^')
}

function isBitwiseNegation (left, right) {
  return getBinaryExpression(left, right, '~')
}

function hasNumber (node) {
  const code = AbstractSyntaxTree.generate(node)
  const tree = new AbstractSyntaxTree(`
    Object.prototype.toString.call(${code}) === '[object Number]' ||
    Object.values(${code}).filter(value => typeof value === 'number').length > 0
  `)
  return tree.first('LogicalExpression')
}

function hasNumbers (node) {
  const code = AbstractSyntaxTree.generate(node)
  const tree = new AbstractSyntaxTree(`Array.isArray(${code}) && ${code}.filter(value => typeof value === 'number').length > 1`)
  return tree.first('LogicalExpression')
}

function respondsTo (left, right) {
  return {
    type: 'BinaryExpression',
    left: {
      type: 'UnaryExpression',
      operator: 'typeof',
      prefix: true,
      argument: {
        type: 'MemberExpression',
        object: left,
        property: right.property,
        computed: false
      }
    },
    operator: '===',
    right: {
      type: 'Literal',
      value: 'function'
    }
  }
}

function startsWith (left, right) {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: left,
      property: {
        type: 'Identifier',
        name: 'startsWith'
      },
      computed: false
    },
    arguments: [right]
  }
}

function endsWith (left, right) {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: left,
      property: {
        type: 'Identifier',
        name: 'endsWith'
      },
      computed: false
    },
    arguments: [right]
  }
}

function isDivisible (left, right) {
  return {
    type: 'BinaryExpression',
    left: {
      type: 'BinaryExpression',
      left,
      operator: '%',
      right
    },
    operator: '===',
    right: {
      type: 'Literal',
      value: 0
    }
  }
}

function isPrime (node) {
  const code = AbstractSyntaxTree.generate(node)
  const tree = new AbstractSyntaxTree(`
    (number => {
      for (let i = 2; i < number; i++) if(number % i === 0) return false
      return number !== 1
    })(${code})
  `)
  return tree.first('CallExpression')
}

function geDateComparisonCallExpression (left, right, operator) {
  function getTime (node) {
    return {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: node,
        property: {
          type: 'Identifier',
          name: 'getTime'
        },
        computed: false
      },
      arguments: []
    }
  }
  return {
    type: 'BinaryExpression',
    left: getTime(left),
    operator,
    right: getTime(right)
  }
}

function isSoonerThan (left, right) {
  return geDateComparisonCallExpression(left, right, '<')
}

function isLaterThan (left, right) {
  return geDateComparisonCallExpression(left, right, '>')
}

function haveElements (left, right, operator) {
  if (right.type !== 'Literal') {
    right = { type: 'Literal', value: 0 }
    operator = '>'
  }
  return {
    type: 'BinaryExpression',
    left: {
      type: 'MemberExpression',
      object: left,
      property: {
        type: 'Identifier',
        name: 'length'
      },
      computed: false
    },
    operator,
    right
  }
}

function haveMoreThan (left, right) {
  return haveElements(left, right, '>')
}

function haveLessThan (left, right) {
  return haveElements(left, right, '<')
}

function have (left, right) {
  return haveElements(left, right, '===')
}

function haveMany (left) {
  const right = { type: 'Literal', value: 1 }
  return haveElements(left, right, '>')
}

function isBetween (left, start, end) {
  return {
    type: 'LogicalExpression',
    left: {
      type: 'BinaryExpression',
      left,
      operator: '>=',
      right: start
    },
    operator: '&&',
    right: {
      type: 'BinaryExpression',
      left,
      operator: '<=',
      right: end
    }
  }
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
  { name: 'is_empty', handler: isEmpty, args: 1 },
  { name: 'are_empty', handler: isEmpty, args: 1 },
  { name: 'is_null', handler: getCondition('isNull'), args: 1 },
  { name: 'is_undefined', handler: getCondition('isUndefined'), args: 1 },
  { name: 'is_void', handler: getCondition('isUndefined'), args: 1 },
  { name: 'is_even', handler: getCondition('isEven'), args: 1 },
  { name: 'is_odd', handler: getCondition('isOdd'), args: 1 },
  { name: 'is_numeric', handler: isNumeric, args: 1 },
  { name: 'is_an_array', handler: getCondition('isArray'), args: 1 },
  { name: 'is_an_object', handler: isObject, args: 1 },
  { name: 'is_frozen', handler: getCondition('isFrozen'), args: 1 },
  { name: 'is_sealed', handler: getCondition('isSealed'), args: 1 },
  { name: 'is_a_regexp', handler: getCondition('isRegExp'), args: 1 },
  { name: 'is_a_regex', handler: getCondition('isRegExp'), args: 1 },
  { name: 'is_a_number', handler: getCondition('isNumber'), args: 1 },
  { name: 'is_a_multiple_of', handler: isMultiple, args: 2 },
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
  { name: 'is_divisible_by', handler: isDivisible, args: 2 },
  { name: 'is_prime', handler: isPrime, args: 1 },
  { name: 'is_palindrome', handler: getCondition('isPalindrome'), args: 1 },
  { name: 'is_sooner_than', handler: isSoonerThan, args: 2 },
  { name: 'is_before', handler: isSoonerThan, args: 2 },
  { name: 'is_later_than', handler: isLaterThan, args: 2 },
  { name: 'is_after', handler: isLaterThan, args: 2 },
  { name: 'responds_to', handler: respondsTo, args: 2 },
  { name: 'starts_with', handler: startsWith, args: 2 },
  { name: 'ends_with', handler: endsWith, args: 2 },
  { name: 'has_a_whitespace', handler: getCondition('hasWhitespace'), args: 1 },
  { name: 'has_a_newline', handler: getCondition('hasNewLine'), args: 1 },
  { name: 'has_a_number', handler: hasNumber, args: 1 },
  { name: 'has_numbers', handler: hasNumbers, args: 1 },
  { name: 'or', handler: isAlternative, args: 2 },
  { name: 'and', handler: isConjunction, args: 2 },
  { name: 'eq', handler: isEquals, args: 2 },
  { name: 'neq', handler: notEqual, args: 2 },
  { name: 'does_not_equal', handler: notEqual, args: 2 },
  { name: 'is_not_equal_to', handler: notEqual, args: 2 },
  { name: 'gt', handler: isGreaterThan, args: 2 },
  { name: 'is_greater_than', handler: isGreaterThan, args: 2 },
  { name: 'lt', handler: isLessThan, args: 2 },
  { name: 'is_less_than', handler: isLessThan, args: 2 },
  { name: 'gte', handler: isGreaterThanOrEqual, args: 2 },
  { name: 'is_greater_than_or_equals', handler: isGreaterThanOrEqual, args: 2 },
  { name: 'lte', handler: isLessThanOrEqual, args: 2 },
  { name: 'is_less_than_or_equals', handler: isLessThanOrEqual, args: 2 },
  { name: 'equals', handler: isEquals, args: 2 },
  { name: 'includes', handler: includes, args: 2 },
  { name: 'contains', handler: includes, args: 2 },
  { name: 'matches', handler: matches, args: 2 },
  { name: 'bitwise_or', handler: isBitwiseAlternative, args: 2 },
  { name: 'bitwise_and', handler: isBitwiseConjunction, args: 2 },
  { name: 'bitwise_xor', handler: isBitwiseAlternativeNegation, args: 2 },
  { name: 'bitwise_not', handler: isBitwiseNegation, args: 2 },
  { name: 'is_an_email', handler: getCondition('isEmail'), args: 1 },
  { name: 'have_more_than', handler: haveMoreThan, args: 2 },
  { name: 'have_less_than', handler: haveLessThan, args: 2 },
  { name: 'have_many', handler: haveMany, args: 1 },
  { name: 'have', handler: have, args: 2 },
  { name: 'has_more_than', handler: haveMoreThan, args: 2 },
  { name: 'has_less_than', handler: haveLessThan, args: 2 },
  { name: 'has_many', handler: haveMany, args: 1 },
  { name: 'has', handler: have, args: 2 },
  { name: 'is_between', handler: isBetween, args: 3 }
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
