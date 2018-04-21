const { OBJECT_VARIABLE, ESCAPE_VARIABLE, BOOLEAN_ATTRIBUTES } = require('./enum')
const { getLiteral, getIdentifier, getObjectMemberExpression, getTemplateAssignmentExpression } = require('./factory')
const { extract, getName } = require('./string')

function convertToIdentifier (property, variables) {
  return variables.includes(property.split('.')[0]) ? getIdentifier(property) : {
    type: 'MemberExpression',
    computed: false,
    object: getIdentifier(OBJECT_VARIABLE),
    property: getIdentifier(property)
  }
}

function convertToBinaryExpression (nodes) {
  return nodes.reduce((previous, current) => {
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
}

function convertAttribute (name, value, variables) {
  if (value.includes('{') && value.includes('}')) {
    let values = extract(value)
    if (values.length === 1) {
      let property = value.substring(1, value.length - 1)
      return convertToIdentifier(property, variables)
    } else {
      const nodes = []
      values.map((value, index) => {
        if (index > 0) {
          nodes.push(getLiteral(' '))
        }
        if (value.includes('{') && value.includes('}')) {
          let property = value.substring(1, value.length - 1)
          return nodes.push(convertToIdentifier(property, variables))
        }
        return nodes.push(getLiteral(value))
      })
      const expression = convertToBinaryExpression(nodes)
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

function convertHtmlOrTextAttribute (fragment, variables) {
  let { attrs } = fragment
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
        arguments: [argument.expression ? argument.expression : argument],
        fragment
      }
    }
  }
  return null
}

function convertText (text, variables) {
  if (text.includes('{') && text.includes('}')) {
    let values = extract(text)
    if (values.length === 1) {
      let property = text.substring(1, text.length - 1)
      const node = convertToIdentifier(property, variables)
      return [getTemplateAssignmentExpression({
        type: 'CallExpression',
        callee: getIdentifier(ESCAPE_VARIABLE),
        arguments: [node]
      })]
    } else {
      let nodes = []
      values.map((value, index) => {
        if (index > 0) {
          nodes.push(getLiteral(' '))
        }
        if (value.includes('{') && value.includes('}')) {
          let property = value.substring(1, value.length - 1)
          return nodes.push(convertToIdentifier(property, variables))
        }
        return nodes.push(getLiteral(value))
      })
      nodes = nodes.map(node => {
        if (node.type === 'Literal') return node
        return {
          type: 'CallExpression',
          callee: getIdentifier(ESCAPE_VARIABLE),
          arguments: [node]
        }
      })
      const expression = convertToBinaryExpression(nodes)
      return [getTemplateAssignmentExpression(expression)]
    }
  } else {
    return [getTemplateAssignmentExpression(getLiteral(text))]
  }
}

function getNodes (fragment, variables) {
  let node = fragment.tagName
  let { attrs } = fragment
  let nodes = []
  let tag = attrs.find(attr => attr.name === 'tag' || attr.name === 'tag.bind')
  if (tag) {
    const property = tag.name === 'tag' ? tag.value.substring(1, tag.value.length - 1) : tag.value
    nodes.push(getTemplateAssignmentExpression(getLiteral('<')))
    nodes.push(getTemplateAssignmentExpression(getObjectMemberExpression(property)))
  } else {
    nodes.push(getTemplateAssignmentExpression(getLiteral(`<${node}`)))
  }
  let allowed = attrs.filter(attr => attr.name !== 'html' && attr.name !== 'text' && attr.name !== 'tag' && attr.name !== 'tag.bind')
  if (allowed.length) {
    allowed.forEach(attr => {
      if (BOOLEAN_ATTRIBUTES.includes(getName(attr.name))) {
        const expression = getTemplateAssignmentExpression(getLiteral(` ${getName(attr.name)}`))
        if (!attr.value) {
          nodes.push(expression)
        } else {
          nodes.push({
            type: 'IfStatement',
            test: convertAttribute(attr.name, attr.value, variables),
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
            nodes.push(getTemplateAssignmentExpression(convertAttribute(attr.name, value, variables)))
          })
        } else {
          nodes.push(getTemplateAssignmentExpression(convertAttribute(attr.name, value, variables)))
        }
        nodes.push(getTemplateAssignmentExpression(getLiteral('"')))
      }
    })
  }
  nodes.push(getTemplateAssignmentExpression(getLiteral('>')))
  const leaf = convertHtmlOrTextAttribute(fragment, variables)
  if (leaf) {
    nodes.push(getTemplateAssignmentExpression(leaf))
  }
  return nodes
}

module.exports = {
  convertHtmlOrTextAttribute,
  convertAttribute,
  convertText,
  getNodes
}
