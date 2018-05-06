const { OBJECT_VARIABLE, ESCAPE_VARIABLE, BOOLEAN_ATTRIBUTES, UNESCAPED_NAMES } = require('./enum')
const {
  getLiteral, getIdentifier, getObjectMemberExpression,
  getTemplateAssignmentExpression, getEscapeCallExpression
} = require('./factory')
const { extract, getName } = require('./string')
const AbstractSyntaxTree = require('@buxlabs/ast')

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

function convertToExpression (string) {
  const tree = new AbstractSyntaxTree(string)
  const { expression } = tree.ast.body[0]
  return expression
}

function convertAttribute (name, value, variables) {
  if (value.includes('{') && value.includes('}')) {
    let values = extract(value)
    if (values.length === 1) {
      let property = value.substring(1, value.length - 1)
      const expression = convertToExpression(property)
      return getTemplateNode(expression, variables, UNESCAPED_NAMES.includes(name))
    } else {
      const nodes = values.map((value, index) => {
        if (value.includes('{') && value.includes('}')) {
          let property = value.substring(1, value.length - 1)
          const expression = convertToExpression(property)
          return getTemplateNode(expression, variables, UNESCAPED_NAMES.includes(name))
        }
        return getLiteral(value)
      })
      const expression = convertToBinaryExpression(nodes)
      return { type: 'ExpressionStatement', expression }
    }
  } else if (name.endsWith('.bind')) {
    const expression = convertToExpression(value)
    return getTemplateNode(expression, variables, UNESCAPED_NAMES.includes(name.split('.')[0]))
  } else {
    return getLiteral(value)
  }
}

function convertHtmlOrTextAttribute (fragment, variables) {
  let html = fragment.attributes.find(attr => attr.key === 'html' || attr.key === 'html.bind')
  if (html) {
    return convertAttribute(html.key, html.value, variables)
  } else {
    let text = fragment.attributes.find(attr => attr.key === 'text' || attr.key === 'text.bind')
    if (text) {
      let argument = convertAttribute(text.key, text.value, variables)
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

function convertIdentifier (node, variables) {
  if (variables.includes(node.name)) {
    return node
  } else {
    return {
      type: 'MemberExpression',
      computed: false,
      object: getIdentifier(OBJECT_VARIABLE),
      property: node
    }
  }
}

function getTemplateNode (expression, variables, unescape) {
  if (expression.type === 'Literal') {
    return expression
  } else if (expression.type === 'BinaryExpression') {
    return expression
  } else if (expression.type === 'Identifier') {
    const node = convertIdentifier(expression, variables)
    if (unescape) return node
    return getEscapeCallExpression(node)
  } else if (expression.type === 'MemberExpression') {
    if (variables.includes(expression.object.name)) {
      if (unescape) return expression
      return getEscapeCallExpression(expression)
    } else {
      if (expression.object.type === 'Identifier') {
        let leaf = {
          type: 'MemberExpression',
          object: {
            type: 'MemberExpression',
            object: getIdentifier(OBJECT_VARIABLE),
            property: expression.object
          },
          property: expression.property
        }
        if (unescape) return leaf
        return getEscapeCallExpression(leaf)
      } else if (expression.object.type === 'MemberExpression') {
        let leaf = expression.object
        while (leaf.object.type === 'MemberExpression') {
          leaf = leaf.object
        }
        leaf.object = {
          type: 'MemberExpression',
          object: getIdentifier(OBJECT_VARIABLE),
          property: leaf.object
        }
        if (unescape) return expression
        return getEscapeCallExpression(expression)
      }
    }
  } else if (expression.type === 'CallExpression') {
    expression.arguments = expression.arguments.map(node => getTemplateNode(node, variables, unescape))
    if (expression.callee.type === 'Identifier') {
      expression.callee = convertIdentifier(expression.callee, variables)
      if (unescape) return expression
      return getEscapeCallExpression(expression)
    } else if (expression.callee.type === 'MemberExpression') {
      let node = expression.callee.object
      if (expression.callee.object.type === 'Identifier') {
        expression.callee.object = convertIdentifier(expression.callee.object, variables)
        if (unescape) return expression
        return getEscapeCallExpression(expression)
      } else {
        while (node.object && node.object.type === 'MemberExpression') {
          node = node.object
        }
        node.object = convertIdentifier(node.object, variables)
        if (unescape) return expression
        return getEscapeCallExpression(expression)
      }
    }
  }
}

function convertText (text, variables) {
  const nodes = extract(text).map((value, index) => {
    if (value.includes('{') && value.includes('}')) {
      let property = value.substring(1, value.length - 1)
      const expression = convertToExpression(property)
      return getTemplateNode(expression, variables)
    }
    return getLiteral(value)
  })
  if (nodes.length > 1) {
    const expression = convertToBinaryExpression(nodes)
    return [{ type: 'ExpressionStatement', expression }]
  }
  return nodes
}

function convertTag (fragment, variables) {
  let node = fragment.tagName
  let nodes = []
  let tag = fragment.attributes.find(attr => attr.key === 'tag' || attr.key === 'tag.bind')
  if (tag) {
    const property = tag.key === 'tag' ? tag.value.substring(1, tag.value.length - 1) : tag.value
    nodes.push(getLiteral('<'))
    nodes.push(getObjectMemberExpression(property))
  } else {
    nodes.push(getLiteral(`<${node}`))
  }
  let allowed = fragment.attributes.filter(attr => attr.key !== 'html' && attr.key !== 'text' && attr.key !== 'tag' && attr.key !== 'tag.bind')
  if (allowed.length) {
    allowed.forEach(attr => {
      if (BOOLEAN_ATTRIBUTES.includes(getName(attr.key))) {
        const expression = getLiteral(` ${getName(attr.key)}`)
        if (!attr.value) {
          nodes.push(expression)
        } else {
          nodes.push({
            type: 'IfStatement',
            test: convertAttribute(attr.key, attr.value, variables),
            consequent: {
              type: 'BlockStatement',
              body: [getTemplateAssignmentExpression(expression)]
            }
          })
        }
      } else {
        nodes.push(getLiteral(` ${getName(attr.key)}="`))
        let { value } = attr
        if (value.includes('{') && value.includes('}')) {
          let values = extract(value)
          values.forEach(value => {
            nodes.push(convertAttribute(attr.key, value, variables))
          })
        } else {
          nodes.push(convertAttribute(attr.key, value, variables))
        }
        nodes.push(getLiteral('"'))
      }
    })
  }
  nodes.push(getLiteral('>'))
  const leaf = convertHtmlOrTextAttribute(fragment, variables)
  if (leaf) {
    nodes.push(leaf)
  }
  return nodes
}

module.exports = {
  convertHtmlOrTextAttribute,
  convertAttribute,
  convertText,
  convertTag
}
