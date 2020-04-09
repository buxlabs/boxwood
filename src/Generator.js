'use strict'

const Analyzer = require('./Analyzer')

const analyze = (tree) => {
  const analyzer = new Analyzer()
  return analyzer.analyze(tree)
}

class Generator {
  generate (tree) {
    const { params } = analyze(tree)
    const template = new Function(`return function render(${params}) {\n${tree.source}}`)() // eslint-disable-line
    const dynamic = params.length > 0
    return { template, dynamic }
  }
}

module.exports = Generator
