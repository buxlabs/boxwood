const AbstractSyntaxTree = require('@buxlabs/ast')
const { array } = require('@buxlabs/utils')
const {
  getIdentifier,
  getLiteral,
  getTemplateAssignmentExpression,
  getObjectMemberExpression,
  getForLoop,
  getForLoopVariable
} = require('./factory')
const { convertHtmlOrTextAttribute, convertText, getNodes } = require('./convert')
const { walk } = require('./parser')
const { SPECIAL_TAGS, SELF_CLOSING_TAGS, OPERATORS_MAP } = require('./enum')

function getLoopIndex (variables) {
  return array.identifier(variables)
}

function getLoopGuard (variables) {
  return array.identifier(variables)
}

function collect (tree, fragment, variables) {
  if (fragment.used) return
  fragment.used = true
  const tag = fragment.tagName
  const attrs = fragment.attributes
  if (fragment.type === 'element' && !SPECIAL_TAGS.includes(tag)) {
    const nodes = getNodes(fragment, variables)
    nodes.forEach(node => tree.append(node))
    fragment.children.forEach(node => {
      collect(tree, node, variables)
    })
    if (!SELF_CLOSING_TAGS.includes(tag)) {
      const attr = fragment.attributes.find(attr => attr.key === 'tag' || attr.key === 'tag.bind')
      if (attr) {
        const property = attr.key === 'tag' ? attr.value.substring(1, attr.value.length - 1) : attr.value
        tree.append(getTemplateAssignmentExpression(getLiteral('</')))
        tree.append(getTemplateAssignmentExpression(getObjectMemberExpression(property)))
        tree.append(getTemplateAssignmentExpression(getLiteral('>')))
      } else {
        tree.append(getTemplateAssignmentExpression(getLiteral(`</${tag}>`)))
      }
    }
  } else if (fragment.type === 'text') {
    const nodes = convertText(fragment.content, variables)
    return nodes.forEach(node => tree.append(node))
  } else if (tag === 'if') {
    const ast = new AbstractSyntaxTree('')
    walk(fragment, current => {
      collect(ast, current, variables)
    })
    if (attrs.length === 1) {
      const { key } = attrs[0]
      const [prefix] = key.split('.')
      tree.append({
        type: 'IfStatement',
        test: variables.includes(prefix) ? getIdentifier(key) : getObjectMemberExpression(key),
        consequent: {
          type: 'BlockStatement',
          body: ast.ast.body
        }
      })
    } else {
      const keys = attrs.map(attr => attr.key)
      const operator = keys[1]

      const getTest = (action, node) => {
        if (action === 'positive') {
          return {
            type: 'BinaryExpression',
            left: node,
            right: {
              type: 'Literal',
              value: 0
            },
            operator: '>'
          }
        }
        if (action === 'negative') {
          return {
            type: 'BinaryExpression',
            left: node,
            right: {
              type: 'Literal',
              value: 0
            },
            operator: '<'
          }
        }
        if (action === 'finite') {
          return {
            type: 'CallExpression',
            callee: {
              type: 'Identifier',
              name: 'isFinite'
            },
            arguments: [node]
          }
        }
        if (action === 'infinite') {
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
        if (action === 'empty') {
          return {
            type: 'BinaryExpression',
            left: {
              type: 'MemberExpression',
              object: node,
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
          }
        }
        return node
      }

      if (operator === 'is') {
        const action = keys[2]
        const key = keys[0]
        const [prefix] = key.split('.')
        const node = variables.includes(prefix) ? getIdentifier(key) : getObjectMemberExpression(key)
        tree.append({
          type: 'IfStatement',
          test: getTest(action, node),
          consequent: {
            type: 'BlockStatement',
            body: ast.ast.body
          }
        })
      } else if (Object.keys(OPERATORS_MAP).includes(operator)) {
        const condition1 = keys[0]
        const [prefix1] = condition1.split('.')

        const condition2 = keys[2]
        const [prefix2] = condition2.split('.')

        let expression = {
          type: 'LogicalExpression',
          left: variables.includes(prefix1) ? getIdentifier(condition1) : getObjectMemberExpression(condition1),
          right: variables.includes(prefix2) ? getIdentifier(condition2) : getObjectMemberExpression(condition2),
          operator: OPERATORS_MAP[operator]
        }

        for (let i = 3; i < keys.length; i++) {
          const operator = keys[i]
          i += 1
          const condition = keys[i]
          const prefix = condition.split('.')
          expression = {
            type: 'LogicalExpression',
            left: expression,
            right: variables.includes(prefix) ? getIdentifier(condition) : getObjectMemberExpression(condition),
            operator: OPERATORS_MAP[operator]
          }
        }
        tree.append({
          type: 'IfStatement',
          test: expression,
          consequent: {
            type: 'BlockStatement',
            body: ast.ast.body
          }
        })
      }
    }
  } else if (tag === 'elseif') {
    let leaf = tree.ast.body[tree.ast.body.length - 1]
    if (leaf.type === 'IfStatement') {
      const ast = new AbstractSyntaxTree('')
      walk(fragment, current => {
        collect(ast, current, variables)
      })
      while (leaf.alternate && leaf.alternate.type === 'IfStatement') {
        leaf = leaf.alternate
      }
      const { key } = attrs[0]
      const [prefix] = key.split('.')
      leaf.alternate = {
        type: 'IfStatement',
        test: variables.includes(prefix) ? getIdentifier(key) : getObjectMemberExpression(key),
        consequent: {
          type: 'BlockStatement',
          body: ast.ast.body
        }
      }
    }
  } else if (tag === 'else') {
    let leaf = tree.ast.body[tree.ast.body.length - 1]
    if (leaf.type === 'IfStatement') {
      const ast = new AbstractSyntaxTree('')
      walk(fragment, current => {
        collect(ast, current, variables)
      })
      while (leaf.alternate && leaf.alternate.type === 'IfStatement') {
        leaf = leaf.alternate
      }
      leaf.alternate = {
        type: 'BlockStatement',
        body: ast.ast.body
      }
    }
  } else if (tag === 'each' || tag === 'for') {
    const ast = new AbstractSyntaxTree('')
    const [variable, , parent] = attrs.map(attr => attr.key)
    variables.push(variable)
    const index = getLoopIndex(variables.concat(parent))
    variables.push(index)
    const guard = getLoopGuard(variables.concat(parent))
    variables.push(guard)
    ast.append(getForLoopVariable(variable, parent, variables, index))
    walk(fragment, current => {
      collect(ast, current, variables)
    })
    tree.append(getForLoop(parent, ast.ast.body, variables, index, guard))
    variables.pop()
    variables.pop()
    variables.pop()
  } else if (tag === 'slot' && attrs && attrs.length > 0) {
    const leaf = convertHtmlOrTextAttribute(fragment, variables)
    if (leaf) {
      tree.append(getTemplateAssignmentExpression(leaf))
    }
  } else if (tag === 'try') {
    const ast = new AbstractSyntaxTree('')
    walk(fragment, current => {
      collect(ast, current, variables)
    })

    tree.append({
      type: 'TryStatement',
      block: {
        type: 'BlockStatement',
        body: ast.ast.body
      }
    })
  } else if (tag === 'catch') {
    const leaf = tree.ast.body[tree.ast.body.length - 1]
    if (leaf.type === 'TryStatement') {
      const ast = new AbstractSyntaxTree('')
      walk(fragment, current => {
        collect(ast, current, variables)
      })
      leaf.handler = {
        type: 'CatchClause',
        param: {
          type: 'Identifier',
          name: 'exception'
        },
        body: {
          type: 'BlockStatement',
          body: ast.ast.body
        }
      }
    }
  } else if (tag === 'unless') {
    const ast = new AbstractSyntaxTree('')
    walk(fragment, current => {
      collect(ast, current, variables)
    })
    const { key } = attrs[0]
    const [prefix] = key.split('.')

    tree.append({
      type: 'IfStatement',
      test: {
        type: 'UnaryExpression',
        operator: '!',
        argument: variables.includes(prefix) ? getIdentifier(key) : getObjectMemberExpression(key)
      },
      consequent: {
        type: 'BlockStatement',
        body: ast.ast.body
      }
    })
  } else if (tag === 'elseunless') {
    let leaf = tree.ast.body[tree.ast.body.length - 1]
    if (leaf.type === 'IfStatement') {
      const ast = new AbstractSyntaxTree('')
      walk(fragment, current => {
        collect(ast, current, variables)
      })
      while (leaf.alternate && leaf.alternate.type === 'IfStatement') {
        leaf = leaf.alternate
      }
      const { key } = attrs[0]
      const [prefix] = key.split('.')
      leaf.alternate = {
        type: 'IfStatement',
        test: {
          type: 'UnaryExpression',
          operator: '!',
          argument: variables.includes(prefix) ? getIdentifier(key) : getObjectMemberExpression(key)
        },
        consequent: {
          type: 'BlockStatement',
          body: ast.ast.body
        }
      }
    }
  }
}

module.exports = collect
