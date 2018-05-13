const assert = require('assert')
const { getAction, getExpression } = require('./action')

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

assert.deepEqual(getAction(['and']).handler('foo', 'bar'), {
  type: 'LogicalExpression',
  left: 'foo',
  operator: '&&',
  right: 'bar'
})

assert.deepEqual(getAction(['lte']).handler('foo', 'bar'), {
  type: 'LogicalExpression',
  left: 'foo',
  operator: '<=',
  right: 'bar'
})
