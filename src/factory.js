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
  getForLoop (name, body) {
    return {
      type: 'ForStatement',
      init: {
        type: 'VariableDeclaration',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: getIdentifier('i'),
            init: getLiteral(0)
          },
          {
            type: 'VariableDeclarator',
            id: getIdentifier('ilen'),
            init: {
              type: 'MemberExpression',
              object: {
                type: 'MemberExpression',
                object: getIdentifier(OBJECT_VARIABLE),
                property: getIdentifier(name)
              },
              property: getIdentifier('length'),
              computed: false
            }
          }
        ],
        kind: 'var'
      },
      test: {
        type: 'BinaryExpression',
        left: getIdentifier('i'),
        operator: '<',
        right: getIdentifier('ilen')
      },
      update: {
        type: 'AssignmentExpression',
        operator: '+=',
        left: getIdentifier('i'),
        right: getLiteral(1)
      },
      body: {
        type: 'BlockStatement',
        body
      }
    }
  },
  getForLoopVariable (variable, parent) {
    return {
      type: 'VariableDeclaration',
      declarations: [
        {
          type: 'VariableDeclarator',
          id: getIdentifier(variable),
          init: {
            type: 'MemberExpression',
            object: {
              type: 'MemberExpression',
              object: getIdentifier(OBJECT_VARIABLE),
              property: getIdentifier(parent),
            },
            property: getIdentifier('i'),
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
