const AbstractSyntaxTree = require('abstract-syntax-tree')
const Generator = require('../../Generator')

const { match } = AbstractSyntaxTree

function isTag (node) {
  return match(node, 'CallExpression[callee.type="Identifier"][callee.name="tag"]')
}

function convertTag (node) {
  const literal = node.arguments[0]
  const tag = literal.value
  const object = node.arguments[1]
  if (object && object.type === 'ArrayExpression') {
    const nodes = object.elements.map(element => {
      if (isTag(element)) {
        return convertTag(element)
      }
      return element
    })
    const content = nodes.map(node => node.value).join('')
    return { type: 'Literal', value: `<${tag}>${content}</${tag}>` }
  } else if (object && object.type === 'ObjectExpression') {
    return convertObjectExpression(tag, object)
  } else if (object && object.type === 'Literal') {
    return convertLiteral(tag, object)
  } else {
    return { type: 'Literal', value: `<${tag}></${tag}>` }
  }
}

function convertObjectExpression (tag, object) {
  const attributes = object.properties
    .map(property => {
      return property.key.name + '=' + `"${property.value.value}"`
    })
    .join(' ')
  return { type: 'Literal', value: `<${tag} ${attributes}></${tag}>` }
}

function convertLiteral (tag, object) {
  return { type: 'Literal', value: `<${tag}>${object.value}</${tag}>` }
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
