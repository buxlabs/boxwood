const AbstractSyntaxTree = require('abstract-syntax-tree')
const Generator = require('../../Generator')

const { match } = AbstractSyntaxTree

class Compiler {
  constructor (options) {
    this.options = options
  }

  async compile (input) {
    const tree = new AbstractSyntaxTree(input)

    const features = {
      tag: false
    }

    tree.walk(node => {
      if (match(node, 'ImportDeclaration[source.type="Literal"][source.value="boxwood"]')) {
        node.specifiers.forEach(specifier => {
          if (match(specifier, 'ImportSpecifier[imported.type="Identifier"][imported.name="tag"]')) {
            features.tag = true
          }
        })
      }

      if (features.tag && match(node, 'CallExpression[callee.type="Identifier"][callee.name="tag"]')) {
        const literal = node.arguments[0]
        const tag = literal.value
        const object = node.arguments[1]
        if (object && object.type === 'ObjectExpression') {
          const attributes = object.properties
            .map(property => {
              return property.key.name + '=' + `"${property.value.value}"`
            })
            .join(' ')
          tree.append({ type: 'Literal', value: `<${tag} ${attributes}></${tag}>` })
        } else {
          tree.append({ type: 'Literal', value: `<${tag}></${tag}>` })
        }
      }
    })

    tree.remove(node => {
      if (node.type === 'ImportDeclaration' || node.type === 'ExportDefaultDeclaration') {
        return null
      }
      return node
    })

    tree.wrap(body => {
      return [{
        type: 'ReturnStatement',
        argument: body[0]
      }]
    })

    const generator = new Generator()
    return generator.generate(tree)
  }
}

module.exports = Compiler
