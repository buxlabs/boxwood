'use strict'

const { OBJECT_VARIABLE, ESCAPE_VARIABLE, BOOLEAN_ATTRIBUTES, UNESCAPED_NAMES, GLOBAL_VARIABLES } = require('./enum')
const {
  getObjectMemberExpression,
  getTemplateAssignmentExpression, getEscapeCallExpression
} = require('./factory')
const { getLiteral, getIdentifier } = require('./ast')
const { extract, getName, isCurlyTag, isSquareTag, containsCurlyTag, getTagValue } = require('./string')
const { getFilterName, extractFilterName } = require('./filters')
const AbstractSyntaxTree = require('abstract-syntax-tree')
const { array, math, collection, object, json, date } = require('pure-utilities')
const ARRAY_UTILITIES = Object.keys(array)
const MATH_UTILITIES = Object.keys(math)
const COLLECTION_UTILITIES = Object.keys(collection)
const OBJECT_UTILITIES = Object.keys(object)
const JSON_UTILITIES = Object.keys(json)
const DATE_UTILITIES = Object.keys(date)
const { addPlaceholders, removePlaceholders } = require('./keywords')
const { ExpressionError } = require('./errors')

function isUnescapedFilter (filter) {
  const name = getFilterName(extractFilterName(filter))
  return name.startsWith('unescape') ||
      name.startsWith('unquote') ||
      name.startsWith('unwrap') ||
      name.startsWith('htmlstrip') ||
      ARRAY_UTILITIES.includes(name) ||
      MATH_UTILITIES.includes(name) ||
      COLLECTION_UTILITIES.includes(name) ||
      OBJECT_UTILITIES.includes(name) ||
      JSON_UTILITIES.includes(name) ||
      DATE_UTILITIES.includes(name)
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

function convertToExpression (string) {
  string = addPlaceholders(string)
  const tree = new AbstractSyntaxTree(`(${string})`)
  tree.replace({ enter: removePlaceholders })
  const { expression } = tree.body[0]
  return expression
}

function convertAttribute (name, value, variables, currentFilters, translations, languages) {
  if (containsCurlyTag(value)) {
    const values = extract(value)
    if (values.length === 1) {
      const property = values[0].value.substring(1, values[0].value.length - 1)
      const expression = convertToExpression(property)
      const filters = values[0].filters || []
      filters.forEach(filter => currentFilters.push(filter))
      let unescape = UNESCAPED_NAMES.includes(name)
      if (!unescape) {
        filters.forEach(filter => {
          if (isUnescapedFilter(filter)) {
            unescape = true
          }
        })
      }
      return modify(getTemplateNode(expression, variables, unescape), variables, filters, translations, languages)
    } else {
      const nodes = values.map(({ value, filters = [] }, index) => {
        filters.forEach(filter => currentFilters.push(filter))
        if (value.includes('{') && value.includes('}')) {
          const property = value.substring(1, value.length - 1)
          const expression = convertToExpression(property)
          let unescape = UNESCAPED_NAMES.includes(name)
          if (!unescape) {
            filters.forEach(filter => {
              if (isUnescapedFilter(filter)) {
                unescape = true
              }
            })
          }
          return modify(getTemplateNode(expression, variables, unescape), variables, filters, translations, languages)
        }
        return modify(getLiteral(value), variables, filters, translations, languages)
      })
      const expression = convertToBinaryExpression(nodes)
      return expression
    }
  } else if (isSquareTag(value)) {
    value = addPlaceholders(value)
    const tree = new AbstractSyntaxTree(value)
    tree.replace({ enter: removePlaceholders })
    const expression = prependObjectVariable(tree, variables)
    const array = expression.first('ArrayExpression')
    if (array.elements.length === 1) {
      return AbstractSyntaxTree.template('<%= element %> || ""', { element: array.elements[0] })[0]
    }
    return AbstractSyntaxTree.template('<%= array %>.filter(Boolean).join(" ")', { array })[0]
  } else if (name.endsWith('|bind')) {
    const expression = convertToExpression(value)
    return getTemplateNode(expression, variables, UNESCAPED_NAMES.includes(name.split('|')[0]))
  }
  return getLiteral(value)
}

function convertHtmlOrTextAttribute (fragment, variables, currentFilters, translations, languages) {
  const html = fragment.attributes.find(attr => attr.key === 'html' || attr.key === 'html|bind')
  if (html) {
    return convertAttribute(html.key, html.value, variables, currentFilters, translations, languages)
  } else {
    const text = fragment.attributes.find(attr => attr.key === 'text' || attr.key === 'text|bind')
    if (text) {
      const argument = convertAttribute(text.key, text.value, variables, currentFilters, translations, languages)
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
    return getObjectMemberExpression(node.name)
  }
}

function prependObjectVariableToProperty (node, variables) {
  if (!variables.includes(node.key.name)) {
    const object = getIdentifier(OBJECT_VARIABLE)
    object.omit = true
    node.value = {
      type: 'MemberExpression',
      object,
      property: node.value
    }
    node.shorthand = false
    node.value.omit = true
    node.value.property.omit = true
  }
  return node
}

function prependObjectVariableToIdentifier (node, variables) {
  if (!variables.includes(node.name)) {
    node.omit = true
    const object = getIdentifier(OBJECT_VARIABLE)
    object.omit = true
    node = {
      type: 'MemberExpression',
      object,
      property: node,
      omit: true
    }
  }
  return node
}

function isPropertyPrependCandidate (node) {
  return node.type === 'Property' && node.key === node.value
}

function isIdentifierPrependCandidate (node) {
  return node.type === 'Identifier' && !node.omit && !GLOBAL_VARIABLES.includes(node.name)
}

function isMemberExpression (node) {
  return node.type === 'MemberExpression'
}

function replaceCandidates (node, parent, variables) {
  if (isPropertyPrependCandidate(node)) {
    node = prependObjectVariableToProperty(node, variables)
  } else if (parent && parent.type === 'Property' && node.type === 'Identifier' && parent.key === node) {
    node.omit = true
  } else if (isMemberExpression(node)) {
    if (node.property.type === 'Identifier' && !node.computed) node.property.omit = true
  } else if (isIdentifierPrependCandidate(node)) {
    node = prependObjectVariableToIdentifier(node, variables)
  }
  return node
}

function prependObjectVariable (expression, variables) {
  AbstractSyntaxTree.replace(expression, {
    enter: (node, parent) => {
      return replaceCandidates(node, parent, variables)
    }
  })
  return expression
}

function getTemplateNode (expression, variables, unescape) {
  if (expression.type === 'Literal') {
    return expression
  } else if (expression.type === 'Identifier') {
    const node = convertIdentifier(expression, variables)
    if (unescape) return node
    return getEscapeCallExpression(node)
  } else if ([
    'MemberExpression',
    'CallExpression',
    'ArrayExpression',
    'NewExpression',
    'ConditionalExpression',
    'ObjectExpression',
    'LogicalExpression',
    'BinaryExpression'
  ].includes(expression.type)) {
    expression = prependObjectVariable(expression, variables)
    if (unescape || isBooleanReturnFromExpression(expression)) {
      return expression
    }
    return getEscapeCallExpression(expression)
  } else if (expression.type === 'TemplateLiteral') {
    expression.expressions = expression.expressions.map(leaf => {
      return getTemplateNode(leaf, variables, unescape)
    })
    return expression
  } else if (expression.type === 'UnaryExpression') {
    return {
      ...expression,
      argument: getTemplateNode(expression.argument, variables, unescape)
    }
  } else {
    throw new ExpressionError(expression.type)
  }
}

function isComparisonOperator (operator) {
  return (/^(==|===|!=|!==|<|>|<=|>=)$/).test(operator)
}

function isBooleanReturnFromExpression (node) {
  return node.type === 'BinaryExpression' && isComparisonOperator(node.operator)
}

function convertText (text, variables, currentFilters, translations, languages, unescaped = false, compact = false) {
  const nodes = extract(text, compact).map(({ value, filters = [] }, index) => {
    if (isCurlyTag(value)) {
      const property = value.substring(1, value.length - 1).trim()
      const expression = convertToExpression(property)
      filters.forEach(filter => currentFilters.push(filter))
      const name = expression.name
      let unescape = unescaped || UNESCAPED_NAMES.includes(name)
      if (!unescape) {
        filters.forEach(filter => {
          if (isUnescapedFilter(filter)) {
            unescape = true
          }
        })
      }
      return modify(getTemplateNode(expression, variables, unescape), variables, filters, translations, languages)
    }
    return getLiteral(value)
  })
  if (nodes.length > 1) {
    const expression = convertToBinaryExpression(nodes)
    return [expression]
  }
  return nodes
}

function modify (node, variables, filters) {
  if (filters) {
    return filters.reduce((leaf, filter) => {
      const tree = new AbstractSyntaxTree(filter)
      const node = tree.body[0].expression
      if (node.type === 'CallExpression') {
        const name = getFilterName(node.callee.name)
        node.arguments = node.arguments.map(argument => {
          return replaceCandidates(argument, null, variables)
        })
        return {
          type: 'CallExpression',
          callee: {
            type: 'Identifier',
            name
          },
          arguments: [leaf].concat(node.arguments)
        }
      }
      const args = [leaf]
      const name = getFilterName(node.name)
      return {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name
        },
        arguments: args
      }
    }, node)
  }
  return node
}
// TODO remove unused languages prop
function convertTag (fragment, variables, currentFilters, translations, languages, options) {
  const node = fragment.tagName
  const parts = []
  const tag = fragment.attributes.find(attr => attr.key === 'tag' || attr.key === 'tag|bind')
  if (tag) {
    const property = tag.key === 'tag' ? tag.value.substring(1, tag.value.length - 1) : tag.value
    parts.push(getLiteral('<'))
    parts.push(getObjectMemberExpression(property))
  } else {
    parts.push(getLiteral(`<${node}`))
  }
  const allowed = fragment.attributes.filter(attr => attr.key !== 'html' && attr.key !== 'text' && attr.key !== 'tag' && attr.key !== 'tag|bind')
  if (allowed.length) {
    allowed.forEach(attr => {
      if (BOOLEAN_ATTRIBUTES.includes(getName(attr.key))) {
        const expression = getLiteral(` ${getName(attr.key)}`)
        if (!attr.value) {
          parts.push(expression)
        } else {
          parts.push({
            type: 'IfStatement',
            test: convertAttribute(attr.key, attr.value, variables, currentFilters, translations, languages),
            consequent: {
              type: 'BlockStatement',
              body: [getTemplateAssignmentExpression(options.variables.template, expression)]
            }
          })
        }
      } else if (attr.value) {
        parts.push(getLiteral(` ${getName(attr.key)}="`))
        parts.push(convertAttribute(attr.key, attr.value, variables, currentFilters, translations, languages))
        parts.push(getLiteral('"'))
      }
    })
  }
  parts.push(getLiteral('>'))
  const leaf = convertHtmlOrTextAttribute(fragment, variables, currentFilters, translations, languages)
  if (leaf) {
    parts.push(leaf)
  }
  return parts
}

function convertKey (key, variables, filters = [], translations = [], languages = []) {
  if (isCurlyTag(key)) {
    if (key.includes('translate(language)')) {
      return convertText(key, variables, filters, translations, languages)[0]
    }
    key = getTagValue(key)
  }
  const tree = convertToExpression(key)
  return getTemplateNode(tree, variables, true)
}

module.exports = {
  convertHtmlOrTextAttribute,
  convertAttribute,
  convertText,
  convertTag,
  convertToExpression,
  convertToBinaryExpression,
  convertKey,
  modify
}
