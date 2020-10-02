const AbstractSyntaxTree = require('abstract-syntax-tree')
const Generator = require('../../Generator')

const { match } = AbstractSyntaxTree

function isTag (node) {
  return match(node, 'CallExpression[callee.type="Identifier"][callee.name="tag"]')
}

function convertTag (node) {
  if (node.arguments.length === 1) {
    const literal = node.arguments[0]
    const tag = literal.value
    return { type: 'Literal', value: `<${tag}></${tag}>` }
  } else if (node.arguments.length === 2) {
    const literal = node.arguments[0]
    const tag = literal.value
    const second = node.arguments[1]
    if (second && second.type === 'ArrayExpression') {
      const nodes = second.elements.map(element => {
        if (isTag(element)) {
          return convertTag(element)
        }
        return element
      })
      const content = nodes.map(node => node.value).join('')
      return { type: 'Literal', value: `<${tag}>${content}</${tag}>` }
    } else if (second && second.type === 'ObjectExpression') {
      return convertObjectExpression(tag, second)
    } else if (second && second.type === 'Literal') {
      return convertLiteral(tag, second)
    }
    return { type: 'Literal', value: `<${tag}></${tag}>` }
  } else if (node.arguments.length === 3) {
    const literal = node.arguments[0]
    const tag = literal.value
    const second = node.arguments[1]
    const attributes = getAttributes(second)
    const third = node.arguments[2]
    if (third && third.type === 'ArrayExpression') {
      const nodes = third.elements.map(element => {
        if (isTag(element)) {
          return convertTag(element)
        }
        return element
      })
      const content = nodes.map(node => node.value).join('')
      return { type: 'Literal', value: `<${tag} ${attributes}>${content}</${tag}>` }
    } else if (third && third.type === 'Literal') {
      return convertLiteral(tag, third)
    }
    return { type: 'Literal', value: `<${tag} ${attributes}></${tag}>` }
  }
}

function convertObjectExpression (tag, object) {
  const attributes = getAttributes(object)
  return { type: 'Literal', value: `<${tag} ${attributes}></${tag}>` }
}

function convertLiteral (tag, object) {
  return { type: 'Literal', value: `<${tag}>${object.value}</${tag}>` }
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
