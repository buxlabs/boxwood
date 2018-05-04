const assert = require('assert')
const { getAction } = require('./action')

assert.deepEqual(getAction(['is', 'positive'])('foo'), {
  type: 'BinaryExpression',
  left: 'foo',
  right: {
    type: 'Literal',
    value: 0
  },
  operator: '>'
})

assert.deepEqual(getAction(['is', 'negative'])('foo'), {
  type: 'BinaryExpression',
  left: 'foo',
  right: {
    type: 'Literal',
    value: 0
  },
  operator: '<'
})

assert.deepEqual(getAction(['is', 'finite'])('foo'), {
  type: 'CallExpression',
  callee: {
    type: 'Identifier',
    name: 'isFinite'
  },
  arguments: ['foo']
})

assert.deepEqual(getAction(['is', 'infinite'])('foo'), {
  type: 'LogicalExpression',
  left: {
    type: 'BinaryExpression',
    left: 'foo',
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
    left: 'foo',
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
})

assert.deepEqual(getAction(['is', 'empty'])('foo'), {
  type: 'BinaryExpression',
  left: {
    type: 'MemberExpression',
    object: 'foo',
    property: {
      type: 'Identifier',
      name: 'length'
    }
  },
  operator: '===',
  right: {
    type: 'Literal',
    value: 0
  }
})

assert.deepEqual(getAction(['is', 'null'])('foo'), {
  type: 'BinaryExpression',
  left: 'foo',
  operator: '===',
  right: {
    type: 'Literal',
    value: null
  }
})

assert.deepEqual(getAction(['is', 'undefined'])('foo'), {
  type: 'BinaryExpression',
  left: 'foo',
  operator: '===',
  right: {
    type: 'UnaryExpression',
    operator: 'void',
    prefix: 'true',
    argument: {
      type: 'Literal',
      value: 0
    }
  }
})

assert.deepEqual(getAction(['is', 'even'])('foo'), {
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

assert.deepEqual(getAction(['is', 'odd'])('foo'), {
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

assert.deepEqual(getAction(['is', 'an', 'array'])('foo'), {
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

assert.deepEqual(getAction(['is', 'an', 'object'])('foo'), {
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

assert.deepEqual(getAction(['is', 'a', 'regexp'])('foo'), {
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
