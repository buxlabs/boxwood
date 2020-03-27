'use strict'

const {
  TEMPLATE_VARIABLE,
  OBJECT_VARIABLE,
  ESCAPE_VARIABLE
} = require('./enum')
const { replace, generate } = require('abstract-syntax-tree')
const AbstractSyntaxTree = require('abstract-syntax-tree')
const { getIdentifier, getLiteral } = require('./ast')

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

function getNestedObjectMemberExpression (node) {
  const code = `${OBJECT_VARIABLE}.${generate(node)}`
  const tree = new AbstractSyntaxTree(code)
  const memberExpression = tree.first('MemberExpression')
  replace(memberExpression, {
    enter: node => {
      if (node.computed && node.type === 'MemberExpression') {
        if (node.property.type === 'Identifier') {
          node.property = getObjectMemberExpression(node.property.name)
        } else if (node.property.type === 'MemberExpression') {
          node.property = getNestedObjectMemberExpression(node.property)
        }
      }
      return node
    }
  })
  return memberExpression
}

function getEscapeCallExpression (node) {
  return {
    type: 'CallExpression',
    callee: getIdentifier(ESCAPE_VARIABLE),
    arguments: [node]
  }
}

function replaceIdentifierWithObjectMemberExpression (element) {
  replace(element, {
    enter: (node) => {
      if (node.type === 'Identifier' && !node.replaced) {
        const leaf = getObjectMemberExpression(node.name)
        leaf.object.replaced = true
        leaf.property.replaced = true
        return leaf
      }
      return node
    }
  })
}

function getRangeStartIdentifierOrLiteral (range) {
  if (range) {
    const start = range[0]
    if (typeof start === 'number') {
      return getLiteral(start)
    } else if (start.type === 'Identifier') {
      return getObjectMemberExpression(start.name)
    } else if (start.type === 'Literal') {
      return start
    } else if (start.type === 'MemberExpression') {
      return getNestedObjectMemberExpression(start)
    } else {
      replaceIdentifierWithObjectMemberExpression(start)
      return start
    }
  }
  return getLiteral(0)
}

function getRangeEndIdentifierOrLiteral (range, guard) {
  if (range) {
    const end = range[1]
    if (typeof end === 'number') {
      return getLiteral(end)
    } else if (end.type === 'Identifier') {
      return getObjectMemberExpression(end.name)
    } else if (end.type === 'Literal') {
      return end
    } else if (end.type === 'MemberExpression') {
      return getNestedObjectMemberExpression(end)
    } else {
      replaceIdentifierWithObjectMemberExpression(end)
      return end
    }
  }
  return getIdentifier(guard)
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
            init: getRangeStartIdentifierOrLiteral(range)
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
        right: getRangeEndIdentifierOrLiteral(range, guard)
      },
      update: {
        type: 'UpdateExpression',
        operator: '++',
        prefix: false,
        argument: getIdentifier(index)
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
