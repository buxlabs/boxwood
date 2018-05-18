const AbstractSyntaxTree = require('abstract-syntax-tree')
const { getIdentifier, getLiteral } = require('./factory')

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

function isEmpty(node) {
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

function isNull(left) {
  return getBinaryExpression(left, getLiteral(null), '===')
}

function isUndefined(node) {
  return getVoidBinaryExpression(node, '===')
}

function isPresent(node) {
  return getVoidBinaryExpression(node, '!==')
}

function getVoid () {
  return { type: 'UnaryExpression', operator: 'void', prefix: true, argument: getLiteral(0) }
}

function getVoidBinaryExpression(left, operator) {
  return getBinaryExpression(left, getVoid(), operator)
}

function getModuloWithZeroBinaryExpression(left, operator) {
  return getBinaryExpression(getBinaryExpression(left, getLiteral(2), '%'), getLiteral(0), operator)
}

function isEven(node) {
  return getModuloWithZeroBinaryExpression(node, '===')
}

function isOdd(node) {
  return getModuloWithZeroBinaryExpression(node, '!==')
}

function isArray(node) {
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

function isObject(node) {
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

function isRegExp(node) {
  return getObjectWithConstructorBinaryExpression(node, 'RegExp')
}

function isNumber(node) {
  return getObjectWithConstructorBinaryExpression(node, 'Number')
}

function isString(node) {
  return getObjectWithConstructorBinaryExpression(node, 'String')
}

function isSymbol(node) {
  return getObjectWithConstructorBinaryExpression(node, 'Symbol')
}

function isMap(node) {
  return getObjectWithConstructorBinaryExpression(node, 'Map')
}

function isWeakMap(node) {
  return getObjectWithConstructorBinaryExpression(node, 'WeakMap')
}

function isSet(node) {
  return getObjectWithConstructorBinaryExpression(node, 'Set')
}

function isWeakSet(node) {
  return getObjectWithConstructorBinaryExpression(node, 'WeakSet')
}

function isBoolean(node) {
  return getObjectWithConstructorBinaryExpression(node, 'Boolean')
}

function isDate(node) {
  return getObjectWithConstructorBinaryExpression(node, 'Date')
}

function negate(argument) {
  return { type: 'UnaryExpression', operator: '!', prefix: true, argument }
}

function getExpression (type, left, right, operator) {
  return { type, left, right, operator }
}

function getLogicalExpression(left, right, operator) {
  return getExpression('LogicalExpression', left, right, operator)
}

function getBinaryExpression(left, right, operator) {
  return getExpression('BinaryExpression', left, right, operator)
}

function isAlternative(left, right) {
  return getLogicalExpression(left, right, '||')
}

function isConjunction(left, right) {
  return getLogicalExpression(left, right, '&&')
}

function isGreaterThan(left, right) {
 return getLogicalExpression(left, right, '>')
}

function isLessThan(left, right) {
 return getLogicalExpression(left, right, '<')
}

function isGreaterThanOrEqual(left, right) {
 return getLogicalExpression(left, right, '>=')
}

function isLessThanOrEqual(left, right) {
 return getLogicalExpression(left, right, '<=')
}

function isEquals(left, right) {
  return getLogicalExpression(left, right, '===')
}

function notEqual(left, right) {
  return getLogicalExpression(left, right, '!==')
}

function isBitwiseAlternative(left, right) {
  return getBinaryExpression(left, right, '|')
}

function isBitwiseConjunction(left, right) {
 return getBinaryExpression(left, right, '&')
}

function isBitwiseAlternativeNegation(left, right) {
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

function hasNumber(node) {
  const code = AbstractSyntaxTree.generate(node)
  const tree = new AbstractSyntaxTree(`
    Object.prototype.toString.call(${code}) === '[object Number]' ||
    Object.values(${code}).filter(value => typeof value === 'number').length > 0
  `)
  return tree.first('LogicalExpression')
}

function hasNumbers(node) {
  const code = AbstractSyntaxTree.generate(node)
  const tree = new AbstractSyntaxTree(`Array.isArray(${code}) && ${code}.filter(value => typeof value === 'number').length > 1`)
  return tree.first('LogicalExpression')
}

const STANDARD_ACTIONS = [
  { name: ['not'], handler: negate, args: 1 },
  { name: ['is', 'positive'], handler: isPositive, args: 1 },
  { name: ['is', 'negative'], handler: isNegative, args: 1 },
  { name: ['is', 'finite'], handler: isFinite, args: 1 },
  { name: ['is', 'infinite'], handler: isInfinite, args: 1 },
  { name: ['is', 'present'], handler: isPresent, args: 1 },
  { name: ['are', 'present'], handler: isPresent, args: 1 },
  { name: ['is', 'empty'], handler: isEmpty, args: 1 },
  { name: ['are', 'empty'], handler: isEmpty, args: 1 },
  { name: ['is', 'null'], handler: isNull, args: 1 },
  { name: ['is', 'undefined'], handler: isUndefined, args: 1 },
  { name: ['is', 'void'], handler: isUndefined, args: 1 },
  { name: ['is', 'even'], handler: isEven, args: 1 },
  { name: ['is', 'odd'], handler: isOdd, args: 1 },
  { name: ['is', 'an', 'array'], handler: isArray, args: 1 },
  { name: ['is', 'an', 'object'], handler: isObject, args: 1 },
  { name: ['is', 'a', 'regexp'], handler: isRegExp, args: 1 },
  { name: ['is', 'a', 'regex'], handler: isRegExp, args: 1 },
  { name: ['is', 'a', 'number'], handler: isNumber, args: 1 },
  { name: ['is', 'a', 'string'], handler: isString, args: 1 },
  { name: ['is', 'a', 'symbol'], handler: isSymbol, args: 1 },
  { name: ['is', 'a', 'map'], handler: isMap, args: 1 },
  { name: ['is', 'a', 'weakmap'], handler: isWeakMap, args: 1 },
  { name: ['is', 'a', 'set'], handler: isSet, args: 1 },
  { name: ['is', 'a', 'weakset'], handler: isWeakSet, args: 1 },
  { name: ['is', 'a', 'boolean'], handler: isBoolean, args: 1 },
  { name: ['is', 'a', 'date'], handler: isDate, args: 1 },
  { name: ['is', 'true'], handler: isTruthy, args: 1 },
  { name: ['is', 'false'], handler: isFalsy, args: 1 },
  { name: ['is', 'truthy'], handler: isTruthy, args: 1 },
  { name: ['is', 'falsy'], handler: isFalsy, args: 1 },
  { name: ['has', 'a', 'whitespace'], handler: hasWhitespace, args: 1 },
  { name: ['has', 'a', 'newline'], handler: hasNewLine, args: 1 },
  { name: ['has', 'a', 'number'], handler: hasNumber, args: 1 },
  { name: ['has', 'numbers'], handler: hasNumbers, args: 1 },
  { name: ['or'], handler: isAlternative, args: 2 },
  { name: ['and'], handler: isConjunction, args: 2 },
  { name: ['eq'], handler: isEquals, args: 2 },
  { name: ['neq'], handler: notEqual, args: 2 },
  { name: ['does', 'not', 'equal'], handler: notEqual, args: 2 },
  { name: ['is', 'not', 'equal', 'to'], handler: notEqual, args: 2 },
  { name: ['gt'], handler: isGreaterThan, args: 2 },
  { name: ['is', 'greater', 'than'], handler: isGreaterThan, args: 2 },
  { name: ['lt'], handler: isLessThan, args: 2 },
  { name: ['is', 'less', 'than'], handler: isLessThan, args: 2 },
  { name: ['gte'], handler: isGreaterThanOrEqual, args: 2 },
  { name: ['is', 'greater', 'than', 'or', 'equals'], handler: isGreaterThanOrEqual, args: 2 },
  { name: ['lte'], handler: isLessThanOrEqual, args: 2 },
  { name: ['is', 'less', 'than', 'or', 'equals'], handler: isLessThanOrEqual, args: 2 },
  { name: ['equals'], handler: isEquals, args: 2 },
  { name: ['bitwise', 'or'], handler: isBitwiseAlternative, args: 2 },
  { name: ['bitwise', 'and'], handler: isBitwiseConjunction, args: 2 },
  { name: ['bitwise', 'xor'], handler: isBitwiseAlternativeNegation, args: 2 },
  { name: ['bitwise', 'not'], handler: isBitwiseNegation, args: 2 },
]

const NEGATED_ACTIONS = STANDARD_ACTIONS.filter(action => {
  const { name } = action
  if (name.length === 1) return false
  if (name[0] === 'is' && name[1] === 'greater' || name[1] === 'less') return false
  if (name.includes('not')) return false
  return action
}).map(action => {
  const name = action.name.slice(0)
  if (name.includes('has')) {
    name.splice(0, 1, 'does', 'not', 'have')
  } else {
    name.splice(1, 0, 'not')
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
      if (action.name.join('') === name.join('')) {
        return action
      }
    }
  }
}
