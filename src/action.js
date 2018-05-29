const AbstractSyntaxTree = require('abstract-syntax-tree')
const { getIdentifier, getLiteral } = require('./factory')
const { string: { singularize } } = require('pure-utilities')

function isPositive (node) {
  return getCompareWithZeroBinaryExpression(node, '>')
}

function isNegative (node) {
  return getCompareWithZeroBinaryExpression(node, '<')
}

function getCompareWithZeroBinaryExpression (left, operator) {
  return getBinaryExpression(left, getLiteral(0), operator)
}

function isFinite (node) {
  return { type: 'CallExpression', callee: getIdentifier('isFinite'), arguments: [node] }
}

function isInfinite (node) {
  const code = AbstractSyntaxTree.generate(node)
  const tree = new AbstractSyntaxTree(`${code} === Number.POSITIVE_INFINITY || ${code} === Number.NEGATIVE_INFINITY`)
  return tree.first('LogicalExpression')
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

function isNull (left) {
  return getBinaryExpression(left, getLiteral(null), '===')
}

function isUndefined (node) {
  return getVoidBinaryExpression(node, '===')
}

function isPresent (node) {
  return getVoidBinaryExpression(node, '!==')
}

function isAlpha (node) {
  const code = AbstractSyntaxTree.generate(node)
  const tree = new AbstractSyntaxTree(`[...${code}].every(char => /[A-Za-z]/.test(char))`)
  return tree.first('CallExpression')
}

function isAlphaNumeric (node) {
  const code = AbstractSyntaxTree.generate(node)
  const tree = new AbstractSyntaxTree(`[...${code}].every(char => /[A-Za-z0-9]/.test(char))`)
  return tree.first('CallExpression')
}

function getVoid () {
  return { type: 'UnaryExpression', operator: 'void', prefix: true, argument: getLiteral(0) }
}

function getVoidBinaryExpression (left, operator) {
  return getBinaryExpression(left, getVoid(), operator)
}

function getModuloWithZeroBinaryExpression(left, operator) {
  return getBinaryExpression(getBinaryExpression(left, getLiteral(2), '%'), getLiteral(0), operator)
}

function isEven (node) {
  return getModuloWithZeroBinaryExpression(node, '===')
}

function isOdd (node) {
  return getModuloWithZeroBinaryExpression(node, '!==')
}

function isArray (node) {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: getIdentifier('Array'),
      property: getIdentifier('isArray'),
      computed: false
    },
    arguments: [node]
  }
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

function isFrozen (node) {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: 'Object'
      },
      property: {
        type: 'Identifier',
        name: 'isFrozen'
      },
      computed: false
    },
    arguments: [node]
  }
}

function isSealed (node) {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: 'Object'
      },
      property: {
        type: 'Identifier',
        name: 'isSealed'
      },
      computed: false
    },
    arguments: [node]
  }
}

function getObjectWithConstructorBinaryExpression(node, constructor) {
  return {
    type: 'BinaryExpression',
    left: {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: getIdentifier('Object'),
            property: getIdentifier('prototype'),
            computed: false
          },
          property: getIdentifier('toString'),
          computed: false
        },
        property: getIdentifier('call'),
        computed: false
      },
      arguments: [node]
    },
    operator: '===',
    right: getLiteral(`[object ${constructor}]`)
  }
}

function isRegExp (node) {
  return getObjectWithConstructorBinaryExpression(node, 'RegExp')
}

function isNumber (node) {
  return getObjectWithConstructorBinaryExpression(node, 'Number')
}

function isDigit (node) {
  return {
    type: 'BinaryExpression',
    left: {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'Literal',
          value: '0123456789'
        },
        property: {
          type: 'Identifier',
          name: 'indexOf'
        },
        computed: false
      },
      arguments: [node]
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

function isDecimal(node) {
  return {
    type: 'BinaryExpression',
    left: node,
    operator: '%',
    right: {
      type: 'Literal',
      value: 1
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

function isString (node) {
  return getObjectWithConstructorBinaryExpression(node, 'String')
}

function isSymbol (node) {
  return getObjectWithConstructorBinaryExpression(node, 'Symbol')
}

function isMap (node) {
  return getObjectWithConstructorBinaryExpression(node, 'Map')
}

function isWeakMap (node) {
  return getObjectWithConstructorBinaryExpression(node, 'WeakMap')
}

function isSet (node) {
  return getObjectWithConstructorBinaryExpression(node, 'Set')
}

function isWeakSet (node) {
  return getObjectWithConstructorBinaryExpression(node, 'WeakSet')
}

function isBoolean (node) {
  return getObjectWithConstructorBinaryExpression(node, 'Boolean')
}

function isDate (node) {
  return getObjectWithConstructorBinaryExpression(node, 'Date')
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

function isTruthy (node) {
  const argument = {
    type: 'UnaryExpression',
    operator: '!',
    prefix: true,
    argument: node
  }
  return negate(argument)
}

function isFalsy (node) {
  return negate(node)
}

function hasWhitespace (node) {
  return getCallExpressionWithRegExp(node, '\\s|&nbsp;')
}

function hasNewLine (node) {
  return getCallExpressionWithRegExp(node, '\\n')
}

function getCallExpressionWithRegExp (node, pattern) {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'Literal',
        value: {},
        regex: {
          pattern,
          flags: 'g'
        }
      },
      property: {
        type: 'Identifier',
        name: 'test'
      },
      computed: false
    },
    arguments: [node]
  }
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

const STANDARD_ACTIONS = [
  { name: 'not', handler: negate, args: 1 },
  { name: 'is_positive', handler: isPositive, args: 1 },
  { name: 'is_negative', handler: isNegative, args: 1 },
  { name: 'is_finite', handler: isFinite, args: 1 },
  { name: 'is_infinite', handler: isInfinite, args: 1 },
  { name: 'is_present', handler: isPresent, args: 1 },
  { name: 'is_alpha', handler: isAlpha, args: 1 },
  { name: 'is_alphanumeric', handler: isAlphaNumeric, args: 1 },
  { name: 'are_present', handler: isPresent, args: 1 },
  { name: 'is_empty', handler: isEmpty, args: 1 },
  { name: 'are_empty', handler: isEmpty, args: 1 },
  { name: 'is_null', handler: isNull, args: 1 },
  { name: 'is_undefined', handler: isUndefined, args: 1 },
  { name: 'is_void', handler: isUndefined, args: 1 },
  { name: 'is_even', handler: isEven, args: 1 },
  { name: 'is_odd', handler: isOdd, args: 1 },
  { name: 'is_numeric', handler: isNumeric, args: 1 },
  { name: 'is_an_array', handler: isArray, args: 1 },
  { name: 'is_an_object', handler: isObject, args: 1 },
  { name: 'is_frozen', handler: isFrozen, args: 1 },
  { name: 'is_sealed', handler: isSealed, args: 1 },
  { name: 'is_a_regexp', handler: isRegExp, args: 1 },
  { name: 'is_a_regex', handler: isRegExp, args: 1 },
  { name: 'is_a_number', handler: isNumber, args: 1 },
  { name: 'is_a_digit', handler: isDigit, args: 1 },
  { name: 'is_decimal', handler: isDecimal, args: 1 },
  { name: 'is_a_string', handler: isString, args: 1 },
  { name: 'is_a_symbol', handler: isSymbol, args: 1 },
  { name: 'is_a_map', handler: isMap, args: 1 },
  { name: 'is_a_weakmap', handler: isWeakMap, args: 1 },
  { name: 'is_a_set', handler: isSet, args: 1 },
  { name: 'is_a_weakset', handler: isWeakSet, args: 1 },
  { name: 'is_a_boolean', handler: isBoolean, args: 1 },
  { name: 'is_a_date', handler: isDate, args: 1 },
  { name: 'is_true', handler: isTruthy, args: 1 },
  { name: 'is_false', handler: isFalsy, args: 1 },
  { name: 'is_truthy', handler: isTruthy, args: 1 },
  { name: 'is_falsy', handler: isFalsy, args: 1 },
  { name: 'is_divisible_by', handler: isDivisible, args: 2 },
  { name: 'is_prime', handler: isPrime, args: 1 },
  { name: 'is_sooner_than', handler: isSoonerThan, args: 2 },
  { name: 'is_before', handler: isSoonerThan, args: 2 },
  { name: 'is_later_than', handler: isLaterThan, args: 2 },
  { name: 'is_after', handler: isLaterThan, args: 2 },
  { name: 'responds_to', handler: respondsTo, args: 2 },
  { name: 'starts_with', handler: startsWith, args: 2 },
  { name: 'ends_with', handler: endsWith, args: 2 },
  { name: 'has_a_whitespace', handler: hasWhitespace, args: 1 },
  { name: 'has_a_newline', handler: hasNewLine, args: 1 },
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
  { name: 'bitwise_or', handler: isBitwiseAlternative, args: 2 },
  { name: 'bitwise_and', handler: isBitwiseConjunction, args: 2 },
  { name: 'bitwise_xor', handler: isBitwiseAlternativeNegation, args: 2 },
  { name: 'bitwise_not', handler: isBitwiseNegation, args: 2 },
]

const NEGATED_ACTIONS = STANDARD_ACTIONS.filter(action => {
  const { name } = action
  if (name.length === 1) return false
  if (name[0] === 'is' && name[1] === 'greater' || name[1] === 'less') return false
  if (name.includes('not')) return false
  return action
}).map(action => {
  let { name } = action
  if (name.includes('has')) {
    name = 'does_not_have_' + name.substring(4)
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
