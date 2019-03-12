const {
  TEMPLATE_VARIABLE,
  OBJECT_VARIABLE,
  ESCAPE_VARIABLE
} = require('./enum')

function getIdentifier (name) {
  return { type: 'Identifier', name }
}

function getLiteral (value) {
  return { type: 'Literal', value }
}

function getTemplateAssignmentExpression (variable, node) {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'AssignmentExpression',
      operator: '+=',
      left: {
        type: 'Identifier',
        name: variable
      },
      right: node
    }
  }
}

function getObjectMemberExpression (name) {
  return {
    type: 'MemberExpression',
    object: getIdentifier(OBJECT_VARIABLE),
    property: getIdentifier(name)
  }
}

function getEscapeCallExpression (node) {
  return {
    type: 'CallExpression',
    callee: getIdentifier(ESCAPE_VARIABLE),
    arguments: [node]
  }
}

module.exports = {
  getTemplateVariableDeclaration (variable) {
    return {
      type: 'VariableDeclaration',
      declarations: [
        {
          type: 'VariableDeclarator',
          id: getIdentifier(variable),
          init: getLiteral('')
        }
      ],
      kind: 'var'
    }
  },
  getTemplateAssignmentExpression,
  getEscapeCallExpression,
  getTemplateReturnStatement () {
    return {
      type: 'ReturnStatement',
      argument: getIdentifier(TEMPLATE_VARIABLE)
    }
  },
  getObjectMemberExpression,
  getForLoop (name, body, variables, index, guard, range) {
    return {
      type: 'ForStatement',
      init: {
        type: 'VariableDeclaration',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: getIdentifier(index),
            init: getLiteral(range ? range[0] : 0)
          },
          !range && {
            type: 'VariableDeclarator',
            id: getIdentifier(guard),
            init: {
              type: 'MemberExpression',
              object: name,
              property: getIdentifier('length'),
              computed: false
            }
          }
        ].filter(Boolean),
        kind: 'var'
      },
      test: {
        type: 'BinaryExpression',
        left: getIdentifier(index),
        operator: '<',
        right: range ? getLiteral(range[1]) : getIdentifier(guard)
      },
      update: {
        type: 'AssignmentExpression',
        operator: '+=',
        left: getIdentifier(index),
        right: getLiteral(1)
      },
      body: {
        type: 'BlockStatement',
        body
      }
    }
  },
  getForLoopVariable (variable, name, variables, index, range) {
    return {
      type: 'VariableDeclaration',
      declarations: [
        {
          type: 'VariableDeclarator',
          id: getIdentifier(variable),
          init: range ? getIdentifier(index) : {
            type: 'MemberExpression',
            object: name,
            property: getIdentifier(index),
            computed: true
          }
        }
      ],
      kind: 'var'
    }
  },
  getForInLoopVariable (key, value, parent) {
    return {
      type: 'VariableDeclaration',
      declarations: [
        {
          type: 'VariableDeclarator',
          id: getIdentifier(value),
          init: {
            type: 'MemberExpression',
            object: parent,
            property: getIdentifier(key),
            computed: true
          }
        }
      ],
      kind: 'var'
    }
  },
  getForInLoop (key, parent, body) {
    return {
      type: 'ForInStatement',
      left: getIdentifier(key),
      right: parent,
      body: {
        type: 'BlockStatement',
        body
      }
    }
  },
  getIdentifier,
  getLiteral,
  getTranslateCallExpression (key) {
    return {
      type: 'CallExpression',
      callee: {
        type: 'Identifier',
        name: 'translate'
      },
      arguments: [
        {
          type: 'Literal',
          value: key
        },
        getObjectMemberExpression('language')
      ]
    }
  },
  getTryStatement (body) {
    return {
      type: 'TryStatement',
      block: {
        type: 'BlockStatement',
        body
      }
    }
  },
  getCatchClause (body) {
    return {
      type: 'CatchClause',
      param: {
        type: 'Identifier',
        name: 'exception'
      },
      body: {
        type: 'BlockStatement',
        body
      }
    }
  }
}
