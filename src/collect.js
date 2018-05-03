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
const { convertHtmlOrTextAttribute, convertText, convertTag, convertAttribute } = require('./convert')
const { walk } = require('./parser')
const { SPECIAL_TAGS, SELF_CLOSING_TAGS, OPERATORS_MAP, BITWISE_OPERATORS_MAP } = require('./enum')

function getFreeIdentifier (variables) {
  return array.identifier(variables)
}

function getTemplateIdentifier (prefix, key, variables) {
  return variables.includes(prefix) ? getIdentifier(key) : getObjectMemberExpression(key)
}

function collect (tree, fragment, variables) {
  if (fragment.used) return
  fragment.used = true
  const tag = fragment.tagName
  const attrs = fragment.attributes
  if (fragment.type === 'element' && !SPECIAL_TAGS.includes(tag)) {
    const nodes = convertTag(fragment, variables)
    nodes.forEach(node => {
      if (node.type === 'IfStatement') {
        return tree.append(node)
      }
      tree.append(getTemplateAssignmentExpression(node))
    })
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
    return nodes.forEach(node => tree.append(getTemplateAssignmentExpression(node)))
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
        test: getTemplateIdentifier(prefix, key, variables),
        consequent: {
          type: 'BlockStatement',
          body: ast.body()
        }
      })
    } else {
      const keys = attrs.map(attr => attr.key)
      const operator = keys[1]

      const getTest = (keys, node) => {
        const action = keys[2]

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
        if (action === 'null') {
          return {
            type: 'BinaryExpression',
            left: node,
            operator: '===',
            right: {
              type: 'Literal',
              value: null
            }
          }
        }
        if (action === 'undefined') {
          return {
            type: 'BinaryExpression',
            left: node,
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
          }
        }
        if (action === 'even' || action === 'odd') {
          const operator = action === 'even' ? '===' : '!=='
          return {
            type: 'BinaryExpression',
            left: {
              type: 'BinaryExpression',
              left: node,
              operator: '%',
              right: {
                type: 'Literal',
                value: 2
              }
            },
            operator,
            right: {
              type: 'Literal',
              value: 0
            }
          }
        }
        if (action === 'a' || action === 'an') {
          const capitalize = (string) => string[0].toUpperCase() + string.substring(1)
          const type = keys[3]
          const constructor = type === 'regexp' ? 'RegExp' : capitalize(type)
          if (type === 'array') {
            return {
              type: 'CallExpression',
              callee: {
                type: 'MemberExpression',
                object: {
                  type: 'Identifier',
                  name: constructor
                },
                property: {
                  type: 'Identifier',
                  name: 'isArray'
                },
                computed: false
              },
              arguments: [node]
            }
          }
          if (type === 'object') {
            return {
              type: 'LogicalExpression',
              left: {
                type: 'LogicalExpression',
                left: {
                  type: 'BinaryExpression',
                  left: {
                    type: 'UnaryExpression',
                    operator: 'typeof',
                    prefix: true,
                    argument: node
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
                    argument: node
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
                  argument: node
                }
              }
            }
          }
          if (
            type === 'string' ||
            type === 'number' ||
            type === 'symbol' ||
            type === 'map' ||
            type === 'set' ||
            type === 'boolean' ||
            type === 'regexp' ||
            type === 'date'
          ) {
            return {
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
                arguments: [node]
              },
              operator: '===',
              right: {
                type: 'Literal',
                value: `[object ${constructor}]`
              }
            }
          }
        }
        return node
      }

      if (operator === 'is') {
        const key = keys[0]
        const [prefix] = key.split('.')
        const node = getTemplateIdentifier(prefix, key, variables)
        tree.append({
          type: 'IfStatement',
          test: getTest(keys, node),
          consequent: {
            type: 'BlockStatement',
            body: ast.body()
          }
        })
      } else if (Object.keys(OPERATORS_MAP).includes(operator)) {
        const condition1 = keys[0]
        const [prefix1] = condition1.split('.')

        const condition2 = keys[2]
        const [prefix2] = condition2.split('.')

        let expression = {
          type: 'LogicalExpression',
          left: getTemplateIdentifier(prefix1, condition1, variables),
          right: getTemplateIdentifier(prefix2, condition2, variables),
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
            right: getTemplateIdentifier(prefix, condition, variables),
            operator: OPERATORS_MAP[operator]
          }
        }
        tree.append({
          type: 'IfStatement',
          test: expression,
          consequent: {
            type: 'BlockStatement',
            body: ast.body()
          }
        })
      } else if (operator === 'bitwise') {
        const condition1 = keys[0]
        const [prefix1] = condition1.split('.')

        const condition2 = keys[3]
        const [prefix2] = condition2.split('.')
        const operator = keys[2]

        let expression = {
          type: 'BinaryExpression',
          left: getTemplateIdentifier(prefix1, condition1, variables),
          right: getTemplateIdentifier(prefix2, condition2, variables),
          operator: BITWISE_OPERATORS_MAP[operator]
        }
        for (let i = 4; i < keys.length; i++) {
          const operator = keys[i]
          i += 1
          const condition = keys[i]
          const prefix = condition.split('.')
          expression = {
            type: 'BinaryExpression',
            left: expression,
            right: getTemplateIdentifier(prefix, condition, variables),
            operator: OPERATORS_MAP[operator]
          }
        }
        tree.append({
          type: 'IfStatement',
          test: expression,
          consequent: {
            type: 'BlockStatement',
            body: ast.body()
          }
        })
      }
    }
  } else if (tag === 'elseif') {
    let leaf = tree.last('IfStatement')
    if (leaf) {
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
        test: getTemplateIdentifier(prefix, key, variables),
        consequent: {
          type: 'BlockStatement',
          body: ast.body()
        }
      }
    }
  } else if (tag === 'else') {
    let leaf = tree.last('IfStatement')
    if (leaf) {
      const ast = new AbstractSyntaxTree('')
      walk(fragment, current => {
        collect(ast, current, variables)
      })
      while (leaf.alternate && leaf.alternate.type === 'IfStatement') {
        leaf = leaf.alternate
      }
      leaf.alternate = {
        type: 'BlockStatement',
        body: ast.body()
      }
    }
  } else if (tag === 'each' || tag === 'for') {
    const ast = new AbstractSyntaxTree('')
    const [left, operator, right] = attrs
    const variable = left.key
    let parent = operator.value || `{${right.key}}`
    const name = convertAttribute('html', parent, variables)

    variables.push(variable)
    parent = parent.substring(1, parent.length - 1) // TODO: Handle nested properties
    const index = getFreeIdentifier(variables.concat(parent))
    variables.push(index)
    const guard = getFreeIdentifier(variables.concat(parent))
    variables.push(guard)
    ast.append(getForLoopVariable(variable, name, variables, index))
    walk(fragment, current => {
      collect(ast, current, variables)
    })
    tree.append(getForLoop(name, ast.body(), variables, index, guard))
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
        body: ast.body()
      }
    })
  } else if (tag === 'catch') {
    const leaf = tree.last('TryStatement')
    if (leaf) {
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
          body: ast.body()
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
        argument: getTemplateIdentifier(prefix, key, variables)
      },
      consequent: {
        type: 'BlockStatement',
        body: ast.body()
      }
    })
  } else if (tag === 'elseunless') {
    let leaf = tree.last('IfStatement')
    if (leaf) {
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
          argument: getTemplateIdentifier(prefix, key, variables)
        },
        consequent: {
          type: 'BlockStatement',
          body: ast.body()
        }
      }
    }
  }
}

module.exports = collect
