const { SAXParser } = require('parse5')
const AbstractSyntaxTree = require('@buxlabs/ast')

class Tree extends AbstractSyntaxTree {
  getTemplateAssignmentExpression (node) {
    return {
      type: 'ExpressionStatement',
      expression: {
        type: 'AssignmentExpression',
        operator: '+=',
        left: {
          type: 'Identifier',
          name: 't'
        },
        right: node
      }
    }
  }
  addTemplateAssignmentExpression (node) {
    const expression = this.getTemplateAssignmentExpression(node)
    this.append(expression)
  }
}

function singlespace (string) {
  return string.replace(/\s\s+/g, ' ')
}

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
    const tree = new Tree('')
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
          tree.addTemplateAssignmentExpression(right)
        }
      } else if (attrs) {
        tree.addTemplateAssignmentExpression({
          type: 'Literal',
          value: `<${node}`
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
              const expression = tree.getTemplateAssignmentExpression({
                type: 'Literal',
                value: ` ${getName(attr.name)}`
              })
              if (!attr.value) {
                tree.append(expression)
              } else {
                tree.append({
                  type: 'IfStatement',
                  test: getValue(attr.name, attr.value),
                  consequent: {
                    type: 'BlockStatement',
                    body: [expression]
                  }
                })
              }
            } else {
              tree.addTemplateAssignmentExpression({
                type: 'Literal',
                value: ` ${getName(attr.name)}="`
              })
              let { value } = attr
              if (value.includes('{') && value.includes('}')) {
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
                
                values.map(string => string.trim()).filter(Boolean).forEach((value, index) => {
                  if (index > 0) {
                    tree.addTemplateAssignmentExpression({ type: 'Literal', value: ' ' })
                  }
                  tree.addTemplateAssignmentExpression(getValue(attr.name, value))
                })
              } else {
                tree.addTemplateAssignmentExpression(getValue(attr.name, value))
              }
              tree.addTemplateAssignmentExpression({ type: 'Literal', value: '"' })
            }

          })
        }
        tree.addTemplateAssignmentExpression({
          type: 'Literal',
          value: `>`
        })
        let right = serialize(node, attrs)
        if (right) {
          tree.addTemplateAssignmentExpression(right)
        }
      }
    })
    parser.on('endTag', node => {
      if (node !== 'slot') {
        tree.addTemplateAssignmentExpression({
          type: 'Literal',
          value: `</${node}>`
        })
      }
    })
    parser.on('text', text => {
      tree.addTemplateAssignmentExpression({
        type: 'Literal',
        value: text
      })
    })
    parser.write(`<slot>${source}</slot>`)

    tree.append({
      type: 'ReturnStatement',
      argument: { type: 'Identifier', name: 't' }
    })
    const body = tree.toString()
    const fn = new Function('o', 'e', body) // eslint-disable-line
    return fn
  }
}
