const AbstractSyntaxTree = require('abstract-syntax-tree')
const Bundler = require('./Bundler')
const { OBJECT_VARIABLE } = require('../../utilities/enum')

class Compiler {
  constructor (options) {
    this.options = options
  }

  async compile (input) {
    const bundler = new Bundler(this.options)
    const bundle = await bundler.bundle(input)
    const tree = new AbstractSyntaxTree(bundle)
    const expression = tree.first('CallExpression > ArrowFunctionExpression')
    const { body } = expression.body
    const lastNode = body.pop()
    body.push({ type: 'ReturnStatement', argument: lastNode.expression })
    const template = new Function(`return function render(${OBJECT_VARIABLE}) {\nreturn ${tree.source}}`)() // eslint-disable-line
    return { template }
  }
}

module.exports = Compiler
