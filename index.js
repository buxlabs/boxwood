const { parseFragment } = require('parse5')
const AbstractSyntaxTree = require('@buxlabs/ast')
const TEMPLATE_VARIABLE = 't'

function walk(node, callback) {
  callback(node)
  if (node.childNodes) {
    let child = node.childNodes[0]
    let i = 0
    while (child) {
      walk(child, callback)
      child = node.childNodes[++i]
    }
  }
}

function getTemplateAssignmentExpression (node) {
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
}

function singlespace (string) {
  return string.replace(/\s\s+/g, ' ')
}

function extract (value) {
  let values = []
  let string = ''
  singlespace(value).split('').forEach(character => {
    if (character === '{') {
      if (string) {
        values.push(string)
        string = ''
      }  
    }
    string += character
    if (character === '}') {
      values.push(string)
      string = ''
    }
  })
  values.push(string)
  
  return values.map(string => string.trim()).filter(Boolean)
}

function getName (name) {
  if (name.endsWith('.bind')) {
    return name.substring(0, name.length - 5)
  }
  return name
}

function getValue (name, value) {
  if (value.includes('{') && value.includes('}')) {
    let values = extract(value)
    if (values.length === 1) {
      let property = value.substring(1, value.length - 1)
      return {
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'o' },
        property: { type: 'Identifier', name: property }
      }
    } else {
      const nodes = []
      values.map((value, index) => {
        if (index > 0) {
          nodes.push({ type: 'Literal', value: ' ' })
        }
        if (value.includes('{') && value.includes('}')) {
          let property = value.substring(1, value.length - 1)
          return nodes.push({
            type: 'MemberExpression',
            computed: false,
            object: { type: 'Identifier', name: 'o' },
            property: { type: 'Identifier', name: property }
          })
        }
        return nodes.push({ type: 'Literal', value: value })
      })
      const expression = nodes.reduce((previous, current) => {
        if (!previous.left) {
          previous.left = current
          return previous
        } else if (!previous.right) {
          previous.right = current
          return previous
        }
        return { type: 'BinaryExpression', operator: '+', left: previous, right: current }
      }, {
        type: 'BinaryExpression', operator: '+'
      })
      return { type: 'ExpressionStatement', expression }
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
      let argument = getValue(text.name, text.value)
      return {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'e'
        },
        arguments: [argument.expression ? argument.expression : argument]
      }
    }
  }
  return null
}

module.exports = {
  render () {},
  compile (source) {
    const tree = parseFragment(source, { locationInfo: true })
    const start = new AbstractSyntaxTree('')
    const end = new AbstractSyntaxTree('')
    start.append({
      type: 'VariableDeclaration',
      declarations: [
        {
          type: 'VariableDeclarator',
          id: { type: 'Identifier', name: TEMPLATE_VARIABLE },
          init: { type: 'Literal', value: '' }
        }
      ],
      kind: 'var'
    })
    function appendNode (start, node, attrs) {
      start.append(getTemplateAssignmentExpression({
        type: 'Literal',
        value: `<${node}`
      }))
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
            const expression = getTemplateAssignmentExpression({
              type: 'Literal',
              value: ` ${getName(attr.name)}`
            })
            if (!attr.value) {
              start.append(expression)
            } else {
              start.append({
                type: 'IfStatement',
                test: getValue(attr.name, attr.value),
                consequent: {
                  type: 'BlockStatement',
                  body: [expression]
                }
              })
            }
          } else {
            start.append(getTemplateAssignmentExpression({
              type: 'Literal',
              value: ` ${getName(attr.name)}="`
            }))
            let { value } = attr
            if (value.includes('{') && value.includes('}')) {
              let values = extract(value)
              values.forEach((value, index) => {
                if (index > 0) {
                  start.append(getTemplateAssignmentExpression({ type: 'Literal', value: ' ' }))
                }
                start.append(getTemplateAssignmentExpression(getValue(attr.name, value)))
              })
            } else {
              start.append(getTemplateAssignmentExpression(getValue(attr.name, value)))
            }
            start.append(getTemplateAssignmentExpression({ type: 'Literal', value: '"' }))
          }
        })
      }
      start.append(getTemplateAssignmentExpression({
        type: 'Literal',
        value: `>`
      }))
      let right = serialize(node, attrs)
      if (right) {
        start.append(getTemplateAssignmentExpression(right))
      }
    }
    walk(tree, fragment => {
      const node = fragment.nodeName
      const attrs = fragment.attrs
      if (node === '#document-fragment' || fragment.used) return
      if (node === '#text') {
        start.append(getTemplateAssignmentExpression({
          type: 'Literal',
          value: fragment.value
        }))
      }
      if (node === 'slot' && attrs) {
        const repeat = attrs.find(attr => attr.name === 'repeat.for') 
        if (repeat) {
          const body = new AbstractSyntaxTree('')
          let index = 0
          walk(fragment, current => {
            index += 1
            if (index === 1) return
            current.used = true
            const node = current.nodeName
            const attrs = current.attrs
            if (attrs) {
              appendNode(body, node, attrs)
            }
            if (current.__location.endTag) {
              if (node !== 'slot') {
                body.append(getTemplateAssignmentExpression({
                  type: 'Literal',
                  value: `</${node}>`
                }))
              }
            }
          })
          start.append({
            type: 'ForStatement',
            init: {
              type: 'VariableDeclaration',
              declarations: [
                {
                  'type': 'VariableDeclarator',
                  'id': {
                    'type': 'Identifier',
                    'name': 'i'
                  },
                  'init': {
                    'type': 'Literal',
                    'value': 0
                  }
                },
                {
                  'type': 'VariableDeclarator',
                  'id': {
                    'type': 'Identifier',
                    'name': 'ilen'
                  },
                  'init': {
                    'type': 'MemberExpression',
                    'object': {
                      type: 'MemberExpression',
                      object: {
                        type: 'Identifier',
                        name: 'o'
                      },
                      property: {
                        type: 'Identifier',
                        name: 'todos'
                      }
                    },
                    'property': {
                      'type': 'Identifier',
                      'name': 'length'
                    },
                    'computed': false
                  }
                }
              ],
              'kind': 'var'
            },
            'test': {
              'type': 'BinaryExpression',
              'left': {
                'type': 'Identifier',
                'name': 'i'
              },
              'operator': '<',
              'right': {
                'type': 'Identifier',
                'name': 'ilen'
              }
            },
            'update': {
              'type': 'AssignmentExpression',
              'operator': '+=',
              'left': {
                'type': 'Identifier',
                'name': 'i'
              },
              'right': {
                'type': 'Literal',
                'value': 1
              }
            },
            'body': {
              'type': 'BlockStatement',
              'body': body.ast.body
            }
          })
        } else {
          let right = serialize(node, attrs)
          if (right) {
            start.append(getTemplateAssignmentExpression(right))
          }
        }
      } else if (attrs) {
        appendNode(start, node, attrs)
      }
      if (fragment.__location.endTag) {
        if (node !== 'slot') {
          end.append(getTemplateAssignmentExpression({
            type: 'Literal',
            value: `</${node}>`
          }))
        }
      }
    })
    end.append({
      type: 'ReturnStatement',
      argument: { type: 'Identifier', name: TEMPLATE_VARIABLE }
    })
    const body = start.toString() + end.toString()
    const fn = new Function('o', 'e', body) // eslint-disable-line
    return fn
  }
}
