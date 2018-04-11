const { OBJECT_VARIABLE, ESCAPE_VARIABLE, BOOLEAN_ATTRIBUTES } = require('./enum')
const { getLiteral, getIdentifier, getTemplateAssignmentExpression } = require('./factory')
const { singlespace, extract, getName } = require('./string')

function convertAttribute (name, value, variables = []) {
  if (value.includes('{') && value.includes('}')) {
    let values = extract(value)
    if (values.length === 1) {
      let property = value.substring(1, value.length - 1)
      return variables.includes(property.split('.')[0]) ? getIdentifier(property) : {
        type: 'MemberExpression',
        computed: false,
        object: getIdentifier(OBJECT_VARIABLE),
        property: getIdentifier(property)
      }
    } else {
      const nodes = []
      values.map((value, index) => {
        if (index > 0) {
          nodes.push(getLiteral(' '))
        }
        if (value.includes('{') && value.includes('}')) {
          let property = value.substring(1, value.length - 1)
          return nodes.push(variables.includes(property.split('.')[0]) ? getIdentifier(property) : {
            type: 'MemberExpression',
            computed: false,
            object: getIdentifier(OBJECT_VARIABLE),
            property: getIdentifier(property)
          })
        }
        return nodes.push(getLiteral(value))
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
    return variables.includes(value.split('.')[0]) ? getIdentifier(value) : {
      type: 'MemberExpression',
      computed: false,
      object: getIdentifier(OBJECT_VARIABLE),
      property: getIdentifier(value)
    }
  } else {
    return getLiteral(value)
  }
}

function convertHtmlOrTextAttribute (node, attrs, variables) {
  let html = attrs.find(attr => attr.name === 'html' || attr.name === 'html.bind')
  if (html) {
    return convertAttribute(html.name, html.value, variables)
  } else {
    let text = attrs.find(attr => attr.name === 'text' || attr.name === 'text.bind')
    if (text) {
      let argument = convertAttribute(text.name, text.value, variables)
      return {
        type: 'CallExpression',
        callee: getIdentifier(ESCAPE_VARIABLE),
        arguments: [argument.expression ? argument.expression : argument]
      }
    }
  }
  return null
}

function getNodes (node, attrs, variables = []) {
  let nodes = []
  nodes.push(getTemplateAssignmentExpression(getLiteral(`<${node}`)))
  let allowed = attrs.filter(attr => attr.name !== 'html' && attr.name !== 'text')
  if (allowed.length) {
    allowed.forEach(attr => {
      if (BOOLEAN_ATTRIBUTES.includes(getName(attr.name))) {
        const expression = getTemplateAssignmentExpression(getLiteral(` ${getName(attr.name)}`))
        if (!attr.value) {
          nodes.push(expression)
        } else {
          nodes.push({
            type: 'IfStatement',
            test: convertAttribute(attr.name, attr.value),
            consequent: {
              type: 'BlockStatement',
              body: [expression]
            }
          })
        }
      } else {
        nodes.push(getTemplateAssignmentExpression(getLiteral(` ${getName(attr.name)}="`)))
        let { value } = attr
        if (value.includes('{') && value.includes('}')) {
          let values = extract(value)
          values.forEach((value, index) => {
            if (index > 0) {
              nodes.push(getTemplateAssignmentExpression(getLiteral(' ')))
            }
            nodes.push(getTemplateAssignmentExpression(convertAttribute(attr.name, value)))
          })
        } else {
          nodes.push(getTemplateAssignmentExpression(convertAttribute(attr.name, value)))
        }
        nodes.push(getTemplateAssignmentExpression(getLiteral('"')))
      }
    })
  }
  nodes.push(getTemplateAssignmentExpression(getLiteral('>')))
  const leaf = convertHtmlOrTextAttribute(node, attrs, variables)
  if (leaf) {
    nodes.push(getTemplateAssignmentExpression(leaf))
  }
  return nodes
}

module.exports = {
  convertHtmlOrTextAttribute,
  convertAttribute,
  getNodes
}