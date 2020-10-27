const { match, toBinaryExpression, binaryExpressionReduction } = require('abstract-syntax-tree')
const { SELF_CLOSING_TAGS } = require('../../../utilities/enum')

function isCallExpression (node, name) {
  return match(node, `CallExpression[callee.type="Identifier"][callee.name="${name}"]`)
}

function isTag (node) {
  return isCallExpression(node, 'tag')
}

function isText (node) {
  return isCallExpression(node, 'text')
}

function isState (node) {
  return match(node, 'NewExpression[callee.type="Identifier"][callee.name="State"]')
}

function isInternalImportDeclaration (node) {
  return match(node, 'ImportDeclaration[source.type="Literal"][source.value="boxwood"]')
}

function isFeatureImportSpecifier (specifier, feature) {
  return match(specifier, `ImportSpecifier[imported.type="Identifier"][imported.name="${feature}"]`)
}

function convertLastNode (tag, node, attributes) {
  if (node.type === 'ArrayExpression') {
    const elements = node.elements.map(element => {
      if (isTag(element)) {
        return convertTag(element)
      }
      return element
    })
    if (elements.length === 0) {
      return { type: 'Literal', value: `${startTag(tag, attributes)}${endTag(tag)}` }
    }
    if (elements.length === 1 && elements[0].type === 'Literal') {
      return { type: 'Literal', value: `${startTag(tag, attributes)}${elements[0].value}${endTag(tag)}` }
    }
    return binaryExpressionReduction({
      type: 'BinaryExpression',
      operator: '+',
      left: {
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Literal', value: startTag(tag, attributes) },
        right: toBinaryExpression({
          type: 'ArrayExpression',
          elements: elements
        })
      },
      right: { type: 'Literal', value: endTag(tag) }
    })
  } else if (node.type === 'Literal') {
    return convertLiteral(tag, node, attributes)
  } else if (node.type === 'BinaryExpression') {
    return convertBinaryExpression(tag, node, attributes)
  } else if (node.type === 'TemplateLiteral') {
    return wrapNode(tag, node, attributes)
  } else if (node.type === 'Identifier') {
    return wrapNode(tag, node, attributes)
  } else if (node.type === 'ObjectExpression') {
    return convertObjectExpression(tag, attributes)
  }
}

function convertTag (node) {
  if (node.arguments.length === 1) {
    const first = node.arguments[0]
    const tag = first.value
    return { type: 'Literal', value: getTag(tag) }
  } else if (node.arguments.length === 2) {
    const first = node.arguments[0]
    const tag = first.value
    const last = node.arguments[1]
    if (last) {
      const attributes = last.type === 'ObjectExpression' ? getAttributes(last) : null
      return convertLastNode(tag, last, attributes)
    }
  } else if (node.arguments.length === 3) {
    const first = node.arguments[0]
    const tag = first.value
    const middle = node.arguments[1]
    const last = node.arguments[2]
    if (last) {
      const attributes = middle.type === 'ObjectExpression' ? getAttributes(middle) : null
      return convertLastNode(tag, last, attributes)
    }
  }
}

function convertObjectExpression (tag, attributes) {
  return { type: 'Literal', value: getTag(tag, attributes) }
}

function convertLiteral (tag, object, attributes) {
  return { type: 'Literal', value: `${startTag(tag, attributes)}${object.value}${endTag(tag)}` }
}

function startTag (tag, attributes) {
  if (attributes) {
    return `<${tag} ${attributes}>`
  }
  return `<${tag}>`
}

function endTag (tag) {
  return `</${tag}>`
}

function selfClosingTag (tag, attributes) {
  if (attributes) {
    return `<${tag} ${attributes} />`
  }
  return `<${tag} />`
}

function getTag (tag, attributes) {
  if (SELF_CLOSING_TAGS.includes(tag)) {
    return selfClosingTag(tag, attributes)
  }
  return startTag(tag, attributes) + endTag(tag)
}

function convertBinaryExpression (tag, object, attributes) {
  let leaf = object.left
  if (leaf.left.type === 'BinaryExpression') {
    while (leaf.left.type === 'BinaryExpression') {
      leaf = leaf.left
    }
  }
  leaf.left = {
    type: 'BinaryExpression',
    left: { type: 'Literal', value: startTag(tag, attributes) },
    right: leaf.left,
    operator: '+'
  }
  return {
    type: 'BinaryExpression',
    left: object,
    right: { type: 'Literal', value: endTag(tag) },
    operator: '+'
  }
}

function wrapNode (tag, object, attributes) {
  return {
    type: 'BinaryExpression',
    operator: '+',
    left: {
      type: 'BinaryExpression',
      operator: '+',
      left: { type: 'Literal', value: startTag(tag, attributes) },
      right: object
    },
    right: { type: 'Literal', value: endTag(tag) }
  }
}

function isEventHandler (name) {
  return ['onclick'].includes(name)
}

function getAttributes (object) {
  return object.properties
    .map(property => {
      if (isEventHandler(property.key.name)) { return null }
      return property.key.name + '=' + `"${property.value.value}"`
    })
    .filter(Boolean)
    .join(' ')
}

function convertExportDefaultDeclarationToReturnStatement (node) {
  const { declaration } = node
  declaration.type = 'FunctionExpression'
  const { body } = declaration.body
  const last = body[body.length - 1]
  if (last.type === 'ReturnStatement' && last.argument.type === 'ArrayExpression') {
    const { elements } = last.argument
    if (elements.find(isTag)) {
      if (elements.length === 1) { last.argument = elements[0] }
      if (elements.length === 2) { last.argument = { type: 'BinaryExpression', left: elements[0], right: elements[1], operator: '+' } }
      let expression = { type: 'BinaryExpression', left: elements[0], right: elements[1], operator: '+' }
      for (let i = 2, ilen = elements.length; i < ilen; i += 1) {
        expression = { type: 'BinaryExpression', left: expression, right: elements[i], operator: '+' }
      }
      last.argument = expression
    }
  }
  return {
    type: 'ReturnStatement',
    argument: {
      type: 'CallExpression',
      callee: declaration,
      arguments: []
    }
  }
}

function enableUsedFeatures (node, features) {
  if (isInternalImportDeclaration(node)) {
    node.specifiers.forEach(specifier => {
      features.each(feature => {
        if (isFeatureImportSpecifier(specifier, feature)) {
          features.enable(feature)
        }
      })
    })
  }
}

module.exports = {
  convertLastNode,
  convertLiteral,
  convertTag,
  convertBinaryExpression,
  convertObjectExpression,
  wrapNode,
  getAttributes,
  startTag,
  endTag,
  isTag,
  isText,
  isState,
  isInternalImportDeclaration,
  isFeatureImportSpecifier,
  convertExportDefaultDeclarationToReturnStatement,
  enableUsedFeatures
}
