const { SAXParser } = require('parse5')
const AbstractSyntaxTree = require('@buxlabs/ast')

function getName (name) {
  if (name.endsWith('.bind')) {
    return name.substring(0, name.length - 5)
  }
  return name
}

function getValue (name, value) {
  if (value.startsWith('{') && value.endsWith('}')) {
    let property = value.substring(1, value.length - 1)
    return {
      type: 'MemberExpression',
      computed: false,
      object: { type: 'Identifier', name: 'o' },
      property: { type: 'Identifier', name: property }
    }
  } else if (name.endsWith('.bind')) {
    return {
      type: 'MemberExpression',
      computed: false,
      object: { type: 'Identifier', name: 'o' },
      property: { type: 'Identifier', name: value }
    }
  } else {
    return { type: 'Literal', value }
  }
}

function serialize (node, attrs) {
  let html = attrs.find(attr => attr.name === 'html' || attr.name === 'html.bind')
  if (html) {
    return getValue(html.name, html.value)
  } else {
    let text = attrs.find(attr => attr.name === 'text' || attr.name === 'text.bind')
    if (text) {
      return {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'e'
        },
        arguments: [getValue(text.name, text.value)]
      }
    }
  }
  return null
}

module.exports = {
  render () {},
  compile (source) {
    const parser = new SAXParser()
    const tree = new AbstractSyntaxTree('')
    tree.append({
      type: 'VariableDeclaration',
      declarations: [
        {
          type: 'VariableDeclarator',
          id: { type: 'Identifier', name: 't' },
          init: { type: 'Literal', value: '' }
        }
      ],
      kind: 'var'
    })
    parser.on('startTag', (node, attrs) => {
      if (node === 'slot' && attrs) {
        let right = serialize(node, attrs)
        if (right) {
          tree.append({
            type: 'ExpressionStatement',
            expression: {
              type: 'AssignmentExpression',
              operator: '+=',
              left: {
                type: 'Identifier',
                name: 't'
              },
              right
            }
          })
        }
      } else if (attrs) {
        tree.append({
          type: 'ExpressionStatement',
          expression: {
            type: 'AssignmentExpression',
            operator: '+=',
            left: {
              type: 'Identifier',
              name: 't'
            },
            right: {
              type: 'Literal',
              value: `<${node}`
            }
          }
        })
        let allowed = attrs.filter(attr => attr.name !== 'html' && attr.name !== 'text')
        if (allowed.length) {
          allowed.forEach(attr => {
            const booleanAttributes = [
              "autofocus",
              "checked",
              "readonly",
              "disabled",
              "formnovalidate",
              "multiple",
              "required"
            ]
            if (booleanAttributes.includes(getName(attr.name))) {
              const assignmentExpression = {
                type: 'ExpressionStatement',
                expression: {
                  type: 'AssignmentExpression',
                  operator: '+=',
                  left: { type: 'Identifier', name: 't' },
                  right: { type: 'Literal', value: ` ${getName(attr.name)}` }
                }
              }
              if (!attr.value) {
                tree.append(assignmentExpression)
              } else {
                tree.append({
                  type: 'IfStatement',
                  test: getValue(attr.name, attr.value),
                  consequent: {
                    type: 'BlockStatement',
                    body: [assignmentExpression]
                  }
                })
              }
            } else {
              tree.append({
                type: 'ExpressionStatement',
                expression: {
                  type: 'AssignmentExpression',
                  operator: '+=',
                  left: { type: 'Identifier', name: 't' },
                  right: { type: 'Literal', value: ` ${getName(attr.name)}="` }
                }
              })
              tree.append({
                type: 'ExpressionStatement',
                expression: {
                  type: 'AssignmentExpression',
                  operator: '+=',
                  left: {
                    type: 'Identifier',
                    name: 't'
                  },
                  right: getValue(attr.name, attr.value)
                }
              })
              tree.append({
                type: 'ExpressionStatement',
                expression: {
                  type: 'AssignmentExpression',
                  operator: '+=',
                  left: { type: 'Identifier', name: 't' },
                  right: { type: 'Literal', value: '"' }
                }
              })
            }

          })
        }
        tree.append({
          type: 'ExpressionStatement',
          expression: {
            type: 'AssignmentExpression',
            operator: '+=',
            left: {
              type: 'Identifier',
              name: 't'
            },
            right: {
              type: 'Literal',
              value: `>`
            }
          }
        })
        let right = serialize(node, attrs)
        if (right) {
          tree.append({
            type: 'ExpressionStatement',
            expression: {
              type: 'AssignmentExpression',
              operator: '+=',
              left: {
                type: 'Identifier',
                name: 't'
              },
              right
            }
          })
        }
      }
    })
    parser.on('endTag', node => {
      if (node !== 'slot') {
        tree.append({
          type: 'ExpressionStatement',
          expression: {
            type: 'AssignmentExpression',
            operator: '+=',
            left: {
              type: 'Identifier',
              name: 't'
            },
            right: {
              type: 'Literal',
              value: `</${node}>`
            }
          }
        })
      }
    })
    parser.on('text', text => {
      tree.append({
        type: 'ExpressionStatement',
        expression: {
          type: 'AssignmentExpression',
          operator: '+=',
          left: {
            type: 'Identifier',
            name: 't'
          },
          right: {
            type: 'Literal',
            value: text
          }
        }
      })
    })
    parser.write(`<slot>${source}</slot>`)

    tree.append({
      type: 'ReturnStatement',
      argument: {
        type: 'Identifier',
        name: 't'
      }
    })
    const body = tree.toString()
    const fn = new Function('o', 'e', body) // eslint-disable-line
    return fn
  }
}
