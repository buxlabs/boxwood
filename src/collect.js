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
const { SPECIAL_TAGS, SELF_CLOSING_TAGS } = require('./enum')

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
      const operator = attrs[1].key
      if (operator === 'and') {
        const condition1 = attrs[0].key
        const [prefix1] = condition1.split('.')

        const condition2 = attrs[2].key
        const [prefix2] = condition2.split('.')

        if (attrs[3] && attrs[3].key === 'and' && !attrs[5]) {
          const lastCondition = attrs.pop().key
          const [lastPrefix] = lastCondition.split('.')

          tree.append({
            type: 'IfStatement',
            test: {
              type: 'LogicalExpression',
              left: {
                type: 'LogicalExpression',
                left: variables.includes(prefix1) ? getIdentifier(condition1) : getObjectMemberExpression(condition1),
                operator: '&&',
                right: variables.includes(prefix2) ? getIdentifier(condition2) : getObjectMemberExpression(condition2)
              },
              operator: '&&',
              right: variables.includes(lastPrefix) ? getIdentifier(lastCondition) : getObjectMemberExpression(lastCondition)
            },
            consequent: {
              type: 'BlockStatement',
              body: ast.ast.body
            }
          })
        } else if (attrs[5] && attrs[5].key === 'and') {
          const condition3 = attrs[4].key
          const [prefix3] = condition3.split('.')

          const lastCondition = attrs.pop().key
          const [lastPrefix] = lastCondition.split('.')

          tree.append({
            type: 'IfStatement',
            test: {
              type: 'LogicalExpression',
              left: {
                type: 'LogicalExpression',
                left: {
                  type: 'LogicalExpression',
                  left: variables.includes(prefix1) ? getIdentifier(condition1) : getObjectMemberExpression(condition1),
                  operator: '&&',
                  right: variables.includes(prefix2) ? getIdentifier(condition2) : getObjectMemberExpression(condition2)
                },
                operator: '&&',
                right: variables.includes(prefix3) ? getIdentifier(condition3) : getObjectMemberExpression(condition3),
              },
              operator: '&&',
              right: variables.includes(lastPrefix) ? getIdentifier(lastCondition) : getObjectMemberExpression(lastCondition)
            },
            consequent: {
              type: 'BlockStatement',
              body: ast.ast.body
            }
          })
        }
        else {
          tree.append({
            type: 'IfStatement',
            test: {
              type: 'LogicalExpression',
              left: variables.includes(prefix1) ? getIdentifier(condition1) : getObjectMemberExpression(condition1),
              right: variables.includes(prefix2) ? getIdentifier(condition2) : getObjectMemberExpression(condition2),
              operator: '&&'
            },
            consequent: {
              type: 'BlockStatement',
              body: ast.ast.body
            }
          })
        }
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
