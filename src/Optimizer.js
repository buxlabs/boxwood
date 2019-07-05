const {
  memberExpressionReduction,
  logicalExpressionReduction,
  binaryExpressionReduction,
  ternaryOperatorReduction,
  ifStatementRemoval
} = require('astoptech')
const { TEMPLATE_VARIABLE } = require('./enum')

function isAssignmentExpressionWithLiteral (node) {
  return node && node.type === 'ExpressionStatement' &&
    node.expression.type === 'AssignmentExpression' &&
    node.expression.right.type === 'Literal'
}

function isTemplateVariableDeclaration (node) {
  return node && node.type === 'VariableDeclaration' && node.declarations[0].id.name === TEMPLATE_VARIABLE
}

class Optimizer {
  constructor (program) {
    this.program = program
  }
  optimize () {
    // can the below be done in one walk?
    this.program.replace({ enter: memberExpressionReduction })
    this.program.replace({ enter: logicalExpressionReduction })
    this.program.replace({ enter: binaryExpressionReduction })
    this.program.replace({ enter: ternaryOperatorReduction })
    this.program.replace({ enter: ifStatementRemoval })
    this.concatenateLiterals()
    this.simplifyReturnValue()
  }
  concatenateLiterals () {
    this.program.walk(node => {
      if (node.body && node.body.reduce) {
        node.body = node.body.reduce((result, leaf) => {
          const last = result[result.length - 1]
          if (isAssignmentExpressionWithLiteral(leaf)) {
            if (isTemplateVariableDeclaration(last)) {
              last.declarations[0].init.value += leaf.expression.right.value
            } else if (isAssignmentExpressionWithLiteral(last)) {
              last.expression.right.value += leaf.expression.right.value
            } else {
              result.push(leaf)
            }
          } else {
            result.push(leaf)
          }
          return result
        }, [])
      }
    })
  }
  simplifyReturnValue () {
    const { body } = this.program
    if (body.length === 2) {
      const { value } = body[0].declarations[0].init
      this.program.body = [{ type: 'ReturnStatement', argument: { type: 'Literal', value } }]
    }
  }
}

module.exports = Optimizer
