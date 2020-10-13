const AbstractSyntaxTree = require('abstract-syntax-tree')
const Generator = require('../../Generator')

const { match } = AbstractSyntaxTree

function isTag (node) {
  return match(node, 'CallExpression[callee.type="Identifier"][callee.name="tag"]')
}

function convertLastNode (tag, node, attributes) {
  if (node.type === 'ArrayExpression') {
    const nodes = node.elements.map(element => {
      if (isTag(element)) {
        return convertTag(element)
      }
      return element
    })
    const content = nodes.map(node => node.value).join('')
    return { type: 'Literal', value: `${startTag(tag, attributes)}${content}${endTag(tag)}` }
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
    return { type: 'Literal', value: startTag(tag) + endTag(tag) }
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
  return { type: 'Literal', value: startTag(tag, attributes) + endTag(tag) }
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

function getAttributes (object) {
  return object.properties
    .map(property => {
      return property.key.name + '=' + `"${property.value.value}"`
    })
    .join(' ')
}

class Compiler {
  constructor (options) {
    this.options = options
  }

  async compile (input) {
    const tree = new AbstractSyntaxTree(input)

    const features = {
      tag: false,
      text: false
    }

    tree.replace(node => {
      if (match(node, 'ImportDeclaration[source.type="Literal"][source.value="boxwood"]')) {
        node.specifiers.forEach(specifier => {
          Object.keys(features).forEach(feature => {
            if (match(specifier, `ImportSpecifier[imported.type="Identifier"][imported.name="${feature}"]`)) {
              features[feature] = true
            }
          })
        })
      }
      if (features.tag && isTag(node)) {
        return convertTag(node)
      } else if (features.text && match(node, 'CallExpression[callee.type="Identifier"][callee.name="text"]')) {
        return node.arguments[0]
      } else if (node.type === 'ExportDefaultDeclaration') {
        const { declaration } = node
        declaration.type = 'FunctionExpression'
        const { body } = declaration.body
        const last = body[body.length - 1]
        if (last.type === 'ReturnStatement' && last.argument.type === 'ArrayExpression') {
          const { elements } = last.argument
          const containsTag = !!elements.find(node => match(node.callee, 'Identifier[name="tag"]'))
          if (containsTag) {
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
      return node
    })

    tree.remove(node => {
      if (node.type === 'ImportDeclaration' && node.source.type === 'Literal' && node.source.value === 'boxwood') {
        return null
      }
      return node
    })

    const generator = new Generator()
    return generator.generate(tree)
  }
}

module.exports = Compiler
