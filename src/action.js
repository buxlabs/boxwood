const getAction = (actionName) => {
  for (let action of ACTIONS) {
    if (action.name.join('') === actionName.join('')) {
      return action
    }
  }
}

function isPositive (node) {
  return getCompareWithZeroBinaryExpression(node, '>')
}

function isNegative (node) {
  return getCompareWithZeroBinaryExpression(node, '<')
}

function getCompareWithZeroBinaryExpression (node, operator) {
  return {
    type: 'BinaryExpression',
    left: node,
    right: {
      type: 'Literal',
      value: 0
    },
    operator
  }
}

function isFinite (node) {
  return {
    type: 'CallExpression',
    callee: {
      type: 'Identifier',
      name: 'isFinite'
    },
    arguments: [node]
  }
}

function isInfinite (node) {
  return {
    type: 'LogicalExpression',
    left: {
      type: 'BinaryExpression',
      left: node,
      operator: '===',
      right: {
        type: 'MemberExpression',
        object: {
          type: 'Identifier',
          name: 'Number'
        },
        property: {
          type: 'Identifier',
          name: 'POSITIVE_INFINITY'
        },
        computed: false
      }
    },
    operator: '||',
    right: {
      type: 'BinaryExpression',
      left: node,
      operator: '===',
      right: {
        type: 'MemberExpression',
        object: {
          type: 'Identifier',
          name: 'Number'
        },
        property: {
          type: 'Identifier',
          name: 'NEGATIVE_INFINITY'
        },
        computed: false
      }
    }
  }
}

function isEmpty (node) {
  return {
    type: 'LogicalExpression',
    left: {
      type: 'LogicalExpression',
      left: {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'Identifier',
            name: 'Array'
          },
          property: {
            type: 'Identifier',
            name: 'isArray'
          },
          computed: false
        },
        arguments: [node]
      },
      operator: '||',
      right: {
        type: 'BinaryExpression',
        left: {
          type: 'CallExpression',
          callee: {
            type: 'MemberExpression',
            object: {
              type: 'MemberExpression',
              object: {
                type: 'MemberExpression',
                object: {
                  type: 'Identifier',
                  name: 'Object'
                },
                property: {
                  type: 'Identifier',
                  name: 'prototype'
                },
                computed: false
              },
              property: {
                type: 'Identifier',
                name: 'toString'
              },
              computed: false
            },
            property: {
              type: 'Identifier',
              name: 'call'
            },
            computed: false
          },
          arguments: [node]
        },
        operator: '===',
        right: {
          type: 'Literal',
          value: '[object String]',
        }
      }
    },
    operator: '&&',
    right: {
      type: 'BinaryExpression',
      left: {
        type: 'MemberExpression',
        object: node,
        property: {
          type: 'Identifier',
          name: 'length'
        },
        computedd: false
      },
      operator: '===',
      right: {
        type: 'Literal',
        value: 0
      }
    }
  }
}

function isNull(node) {
  return {
    type: 'BinaryExpression',
    left: node,
    operator: '===',
    right: {
      type: 'Literal',
      value: null
    }
  }
}

function isUndefined(node) {
  return getVoidBinaryExpression(node, '===')
}

function isPresent(node) {
  return getVoidBinaryExpression(node, '!==')
}

function getVoidBinaryExpression(node, operator) {
  return {
    type: 'BinaryExpression',
    left: node,
    operator,
    right: {
      type: 'UnaryExpression',
      operator: 'void',
      prefix: 'true',
      argument: {
        type: 'Literal',
        value: 0
      }
    }
  }
}

function getModuloWithZeroBinaryExpression(node, operator) {
  return {
    type: 'BinaryExpression',
    left: {
      type: 'BinaryExpression',
      left: node,
      operator: '%',
      right: {
        type: 'Literal',
        value: 2
      }
    },
    operator,
    right: {
      type: 'Literal',
      value: 0
    }
  }
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
      object: {
        type: 'Identifier',
        name: 'Array'
      },
      property: {
        type: 'Identifier',
        name: 'isArray'
      },
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
        right: {
          type: 'Literal',
          value: 'function'
        }
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
        right: {
          type: 'Literal',
          value: 'object'
        }
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
            object: {
              type: 'Identifier',
              name: 'Object'
            },
            property: {
              type: 'Identifier',
              name: 'prototype'
            },
            computed: false
          },
          property: {
            type: 'Identifier',
            name: 'toString'
          },
          computed: false
        },
        property: {
          type: 'Identifier',
          name: 'call'
        },
        computed: false
      },
      arguments: [node]
    },
    operator: '===',
    right: {
      type: 'Literal',
      value: `[object ${constructor}]`
    }
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

function negate(node) {
  return {
    type: 'UnaryExpression',
    operator: '!',
    argument: node
  }
}

function getLogicalExpression(left, right, operator) {
  return {
    type: 'LogicalExpression',
    left,
    right,
    operator
  }
}

function getBinaryExpression(left, right, operator) {
  return {
    type: 'BinaryExpression',
    left,
    right,
    operator
  }
}

function isAlternative(left, right) {
  return getLogicalExpression(left, right, '||')
}

function isConjunction(left, right, operator) {
  return getLogicalExpression(left, right, '&&')
}

function isGreaterThan(left, right, operator) {
 return getLogicalExpression(left, right, '>')
}

function isLessThan(left, right, operator) {
 return getLogicalExpression(left, right, '<')
}

function isGreaterThanOrEqual(left, right, operator) {
 return getLogicalExpression(left, right, '>=')
}

function isLessThanOrEqual(left, right, operator) {
 return getLogicalExpression(left, right, '<=')
}

function isEquals(left, right, operator) {
  return getLogicalExpression(left, right, '===')
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

const STANDARD_ACTIONS = [
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
  { name: ['or'], handler: isAlternative, args: 2 },
  { name: ['and'], handler: isConjunction, args: 2 },
  { name: ['eq'], handler: isEquals, args: 2 },
  { name: ['gt'], handler: isGreaterThan, args: 2 },
  { name: ['is', 'greater', 'than'], handler: isGreaterThan, args: 2 },
  { name: ['lt'], handler: isLessThan, args: 2 },
  { name: ['is', 'less', 'than'], handler: isLessThan, args: 2 },
  { name: ['gte'], handler: isGreaterThanOrEqual, args: 2 },
  { name: ['lte'], handler: isLessThanOrEqual, args: 2 },
  { name: ['equals'], handler: isEquals, args: 2 },
  { name: ['bitwise', 'or'], handler: isBitwiseAlternative, args: 2 },
  { name: ['bitwise', 'and'], handler: isBitwiseConjunction, args: 2 },
  { name: ['bitwise', 'xor'], handler: isBitwiseAlternativeNegation, args: 2 },
  { name: ['bitwise', 'not'], handler: isBitwiseNegation, args: 2 },
]

const NEGATED_ACTIONS = STANDARD_ACTIONS.map(action => {
  const name = action.name.slice(0)
  name.splice(1, 0, 'not')
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
  getAction
}
