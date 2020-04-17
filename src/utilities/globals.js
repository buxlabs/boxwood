const { GLOBAL_VARIABLE, OBJECT_VARIABLE } = require('./enum')

function isMemberExpression (node) {
  return node.type === 'MemberExpression'
}

function isIdentifier (node, name) {
  return node.type === 'Identifier' && node.name === name
}

function isMemberExpressionWithGlobalVariable (node) {
  return isMemberExpression(node) &&
    isIdentifier(node.object, OBJECT_VARIABLE) &&
    isIdentifier(node.property, GLOBAL_VARIABLE)
}

function isComplexMemberExpressionWithGlobalVariable (node) {
  return isMemberExpression(node) && isMemberExpressionWithGlobalVariable(node.object)
}

function isExpressionStatementWithGlobalVariable (node) {
  return node.type === 'ExpressionStatement' && isComplexMemberExpressionWithGlobalVariable(node.expression)
}

function isComplexGlobalVariable (node) {
  if (node.type !== 'ExpressionStatement') { return false }
  node = node.expression
  if (node.type !== 'MemberExpression') { return false }
  while (node.object.type === 'MemberExpression') {
    node = node.object
  }
  return isIdentifier(node.object, GLOBAL_VARIABLE)
}

function isGlobalVariable (node) {
  if (!node) { return false }
  return isMemberExpressionWithGlobalVariable(node) ||
    isComplexMemberExpressionWithGlobalVariable(node) ||
    isExpressionStatementWithGlobalVariable(node) ||
    isComplexGlobalVariable(node)
}

module.exports = { isGlobalVariable }
