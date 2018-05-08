const { parse, walk } = require('./src/parser')
const AbstractSyntaxTree = require('@buxlabs/ast')
const { TEMPLATE_VARIABLE, OBJECT_VARIABLE, ESCAPE_VARIABLE } = require('./src/enum')
const { getTemplateVariableDeclaration, getTemplateReturnStatement } = require('./src/factory')
const collect = require('./src/collect')
const utils = require('@buxlabs/utils')

module.exports = {
  render () {},
  compile (source) {
    const htmltree = parse(source)
    const tree = new AbstractSyntaxTree('')
    const variables = [
      TEMPLATE_VARIABLE,
      OBJECT_VARIABLE,
      ESCAPE_VARIABLE
    ]
    const modifiers = []
    tree.append(getTemplateVariableDeclaration())
    walk(htmltree, fragment => {
      collect(tree, fragment, variables, modifiers)
    })
    modifiers.forEach(modifier => {
      if (modifier === 'uppercase') {
        tree.prepend({
          type: 'FunctionDeclaration',
          id: {
            type: 'Identifier',
            name: 'uppercase'
          },
          params: [{
            type: 'Identifier',
            name: 'string'
          }],
          body: {
            type: 'BlockStatement',
            body: [{
              type: 'ReturnStatement',
              argument: {
                type: 'CallExpression',
                callee: {
                  type: 'MemberExpression',
                  object: {
                    type: 'Identifier',
                    name: 'string'
                  },
                  property: {
                    type: 'Identifier',
                    name: 'toUpperCase'
                  },
                  computed: false
                },
                arguments: []
              }
            }]
          }
        })
      } else if (modifier === 'trim') {
        tree.prepend({
          type: 'FunctionDeclaration',
          id: {
            type: 'Identifier',
            name: 'trim'
          },
          params: [{
            type: 'Identifier',
            name: 'string'
          }],
          body: {
            type: 'BlockStatement',
            body: [{
              type: 'ReturnStatement',
              argument: {
                type: 'CallExpression',
                callee: {
                  type: 'MemberExpression',
                  object: {
                    type: 'Identifier',
                    name: 'string'
                  },
                  property: {
                    type: 'Identifier',
                    name: 'trim'
                  },
                  computed: false
                },
                arguments: []
              }
            }]
          }
        })
      } else if (utils.string[modifier]) {
        const x = new AbstractSyntaxTree(utils.string[modifier].toString())
        const fn = x.body()[0]
        fn.id.name = modifier
        tree.prepend(fn)
      }
    })
    tree.append(getTemplateReturnStatement())
    const body = tree.toString()
    return new Function(OBJECT_VARIABLE, ESCAPE_VARIABLE, body) // eslint-disable-line
  }
}
