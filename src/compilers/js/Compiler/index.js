const AbstractSyntaxTree = require('abstract-syntax-tree')
const Bundler = require('../Bundler')
const { OBJECT_VARIABLE } = require('../../../utilities/enum')
const { validateOptions } = require('../../../utilities/options')

class Compiler {
  constructor (options) {
    this.options = options
  }

  async compile (input) {
    const { options } = this
    const errors = validateOptions(options)
    if (errors.length > 0) { return { errors } }
    const bundler = new Bundler(options)
    const bundle = await bundler.bundle(input)
    const tree = new AbstractSyntaxTree(bundle)
    const expression = tree.first('CallExpression > ArrowFunctionExpression')
    const { body } = expression.body
    const lastNode = body.pop()
    body.push({ type: 'ReturnStatement', argument: lastNode.expression })
    const template = new Function(`return function render(${OBJECT_VARIABLE}) {\nreturn ${tree.source}}`)() // eslint-disable-line
    return { template, errors: [] }
  }
}

module.exports = Compiler
