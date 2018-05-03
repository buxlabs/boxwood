const {
  TEMPLATE_VARIABLE,
  OBJECT_VARIABLE
} = require('./enum')

function getIdentifier (name) {
  return { type: 'Identifier', name }
}

function getLiteral (value) {
  return { type: 'Literal', value }
}

module.exports = {
  getTemplateVariableDeclaration () {
    return {
      type: 'VariableDeclaration',
      declarations: [
        {
          type: 'VariableDeclarator',
          id: getIdentifier(TEMPLATE_VARIABLE),
          init: getLiteral('')
        }
      ],
      kind: 'var'
    }
  },
  getTemplateAssignmentExpression (node) {
    return {
      type: 'ExpressionStatement',
      expression: {
        type: 'AssignmentExpression',
        operator: '+=',
        left: {
          type: 'Identifier',
          name: TEMPLATE_VARIABLE
        },
        right: node
      }
    }
  },
  getTemplateReturnStatement () {
    return {
      type: 'ReturnStatement',
      argument: getIdentifier(TEMPLATE_VARIABLE)
    }
  },
  getObjectMemberExpression (name) {
    return {
      type: 'MemberExpression',
      object: getIdentifier(OBJECT_VARIABLE),
      property: getIdentifier(name)
    }
  },
  getForLoop (name, body, variables, index, guard) {
    return {
      type: 'ForStatement',
      init: {
        type: 'VariableDeclaration',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: getIdentifier(index),
            init: getLiteral(0)
          },
          {
            type: 'VariableDeclarator',
            id: getIdentifier(guard),
            init: {
              type: 'MemberExpression',
              object: name,
              property: getIdentifier('length'),
              computed: false
            }
          }
        ],
        kind: 'var'
      },
      test: {
        type: 'BinaryExpression',
        left: getIdentifier(index),
        operator: '<',
        right: getIdentifier(guard)
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
  getForLoopVariable (variable, name, variables, index) {
    return {
      type: 'VariableDeclaration',
      declarations: [
        {
          type: 'VariableDeclarator',
          id: getIdentifier(variable),
          init: {
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
  getIdentifier,
  getLiteral
}
