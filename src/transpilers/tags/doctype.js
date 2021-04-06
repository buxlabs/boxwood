const AbstractSyntaxTree = require('abstract-syntax-tree')

const { CallExpression, Identifier, Literal, ObjectExpression, Property } = AbstractSyntaxTree

module.exports = function doctype () {
  const node = new CallExpression({
    callee: new Identifier({ name: 'tag' }),
    arguments: [
      new Literal({ value: '!DOCTYPE' }),
      new ObjectExpression({
        properties: [
          new Property({
            key: new Identifier({
              name: 'html'
            }),
            value: new Literal({
              value: true
            }),
            kind: 'init',
            computed: false,
            method: false,
            shorthand: false
          })
        ]
      })
    ]
  })
  return node
}
