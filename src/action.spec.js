const assert = require('assert')
const { getAction } = require('./action')

assert.deepEqual(getAction(['is', 'positive']).handler('foo'), {
  type: 'BinaryExpression',
  left: 'foo',
  right: {
    type: 'Literal',
    value: 0
  },
  operator: '>'
})

assert.deepEqual(getAction(['is', 'negative']).handler('foo'), {
  type: 'BinaryExpression',
  left: 'foo',
  right: {
    type: 'Literal',
    value: 0
  },
  operator: '<'
})

assert.deepEqual(getAction(['is', 'finite']).handler('foo'), {
  type: 'CallExpression',
  callee: {
    type: 'Identifier',
    name: 'isFinite'
  },
  arguments: ['foo']
})

assert.deepEqual(getAction(['is', 'null']).handler('foo'), {
  type: 'BinaryExpression',
  left: 'foo',
  operator: '===',
  right: {
    type: 'Literal',
    value: null
  }
})

assert.deepEqual(getAction(['is', 'undefined']).handler('foo'), {
  type: 'BinaryExpression',
  left: 'foo',
  operator: '===',
  right: {
    type: 'UnaryExpression',
    operator: 'void',
    prefix: true,
    argument: {
      type: 'Literal',
      value: 0
    }
  }
})

assert.deepEqual(getAction(['is', 'even']).handler('foo'), {
  type: 'BinaryExpression',
  left: {
    type: 'BinaryExpression',
    left: 'foo',
    operator: '%',
    right: {
      type: 'Literal',
      value: 2
    }
  },
  operator: '===',
  right: {
    type: 'Literal',
    value: 0
  }
})

assert.deepEqual(getAction(['is', 'odd']).handler('foo'), {
  type: 'BinaryExpression',
  left: {
    type: 'BinaryExpression',
    left: 'foo',
    operator: '%',
    right: {
      type: 'Literal',
      value: 2
    }
  },
  operator: '!==',
  right: {
    type: 'Literal',
    value: 0
  }
})

assert.deepEqual(getAction(['is', 'an', 'array']).handler('foo'), {
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
  arguments: ['foo']
})

assert.deepEqual(getAction(['is', 'an', 'object']).handler('foo'), {
  type: 'LogicalExpression',
  left: {
    type: 'LogicalExpression',
    left: {
      type: 'BinaryExpression',
      left: {
        type: 'UnaryExpression',
        operator: 'typeof',
        prefix: true,
        argument: 'foo'
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
        argument: 'foo'
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
      argument: 'foo'
    }
  }
})

assert.deepEqual(getAction(['is', 'a', 'regexp']).handler('foo'), {
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
    arguments: ['foo']
  },
  operator: '===',
  right: {
    type: 'Literal',
    value: '[object RegExp]'
  }
})

assert.deepEqual(getAction(['or']).handler('foo', 'bar'), {
  type: 'LogicalExpression',
  left: 'foo',
  operator: '||',
  right: 'bar'
})

assert.deepEqual(typeof getAction(['is', 'positive']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'negative']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'finite']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'infinite']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'present']).handler, 'function')
assert.deepEqual(typeof getAction(['are', 'present']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'empty']).handler, 'function')
assert.deepEqual(typeof getAction(['are', 'empty']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'null']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'undefined']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'void']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'even']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'odd']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'an', 'array']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'an', 'object']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'a', 'regexp']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'a', 'regex']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'a', 'regex']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'a', 'number']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'a', 'string']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'a', 'symbol']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'a', 'map']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'a', 'weakmap']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'a', 'set']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'a', 'weakset']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'a', 'boolean']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'a', 'date']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'true']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'false']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'truthy']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'falsy']).handler, 'function')
assert.deepEqual(typeof getAction(['has', 'a', 'whitespace']).handler, 'function')
assert.deepEqual(typeof getAction(['has', 'a', 'newline']).handler, 'function')
assert.deepEqual(typeof getAction(['has', 'a', 'number']).handler, 'function')
assert.deepEqual(typeof getAction(['has', 'numbers']).handler, 'function')
assert.deepEqual(typeof getAction(['or']).handler, 'function')
assert.deepEqual(typeof getAction(['and']).handler, 'function')
assert.deepEqual(typeof getAction(['eq']).handler, 'function')
assert.deepEqual(typeof getAction(['gt']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'greater', 'than']).handler, 'function')
assert.deepEqual(typeof getAction(['lt']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'less', 'than']).handler, 'function')
assert.deepEqual(typeof getAction(['gte']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'greater', 'than', 'or', 'equals']).handler, 'function')
assert.deepEqual(typeof getAction(['lte' ]).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'less', 'than', 'or', 'equals']).handler, 'function')
assert.deepEqual(typeof getAction(['equals' ]).handler, 'function')
assert.deepEqual(typeof getAction(['bitwise', 'or']).handler, 'function')
assert.deepEqual(typeof getAction(['bitwise', 'and']).handler, 'function')
assert.deepEqual(typeof getAction(['bitwise', 'xor']).handler, 'function')
assert.deepEqual(typeof getAction(['bitwise', 'not']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'not', 'positive']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'not', 'negative']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'not', 'finite']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'not', 'infinite']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'not', 'present']).handler, 'function')
assert.deepEqual(typeof getAction(['are', 'not', 'present']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'not', 'empty']).handler, 'function')
assert.deepEqual(typeof getAction(['are', 'not', 'empty']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'not', 'null']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'not', 'undefined']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'not', 'void']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'not', 'even']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'not', 'odd']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'not', 'an', 'array']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'not', 'an', 'object']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'not', 'a', 'regexp']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'not', 'a', 'regex']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'not', 'a', 'number']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'not', 'a', 'string']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'not', 'a', 'symbol']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'not', 'a', 'map']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'not', 'a', 'weakmap']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'not', 'a', 'set']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'not', 'a', 'weakset']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'not', 'a', 'boolean']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'not', 'a', 'date']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'not', 'true']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'not', 'false']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'not', 'truthy']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'not', 'falsy']).handler, 'function')
assert.deepEqual(typeof getAction(['does', 'not', 'have', 'a', 'whitespace']).handler, 'function')
assert.deepEqual(typeof getAction(['does', 'not', 'have', 'a', 'newline']).handler, 'function')
assert.deepEqual(typeof getAction(['does', 'not', 'have', 'a', 'number']).handler, 'function')
assert.deepEqual(typeof getAction(['does', 'not', 'have', 'numbers']).handler, 'function')
assert.deepEqual(typeof getAction(['bitwise', 'not', 'or']).handler, 'function')
assert.deepEqual(typeof getAction(['bitwise', 'not', 'and']).handler, 'function')
assert.deepEqual(typeof getAction(['bitwise', 'not', 'xor']).handler, 'function')
assert.deepEqual(typeof getAction(['neq']).handler, 'function')
assert.deepEqual(typeof getAction(['neq']).handler, 'function')
assert.deepEqual(typeof getAction(['does', 'not', 'equal']).handler, 'function')
assert.deepEqual(typeof getAction(['is', 'not', 'equal', 'to']).handler, 'function')

assert.deepEqual(getAction(['or', 'not']), undefined)
assert.deepEqual(getAction(['not', 'not']), undefined)
assert.deepEqual(getAction(['and', 'not']), undefined)
assert.deepEqual(getAction(['eq', 'not']), undefined)
assert.deepEqual(getAction(['gt', 'not']), undefined)
assert.deepEqual(getAction(['lt', 'not']), undefined)
assert.deepEqual(getAction(['gte', 'not']), undefined)
assert.deepEqual(getAction(['lte', 'not']), undefined)

assert.deepEqual(getAction(['is', 'not', 'greater', 'than']), undefined)
assert.deepEqual(getAction(['is', 'not', 'greater', 'than']), undefined)
assert.deepEqual(getAction(['is', 'not', 'less', 'than']), undefined)
assert.deepEqual(getAction(['is', 'not', 'less', 'than', 'or', 'equals']), undefined)


