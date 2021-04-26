'use strict'

const test = require('ava')
const { program, generate } = require('abstract-syntax-tree')
const { transpileNode } = require('./node')
const { parse } = require('../utilities/html')

function transpile (input) {
  const htmlTree = parse(input)
  const jsTree = transpileNode({ node: htmlTree[0], parent: htmlTree, index: 0 })
  return generate(program(jsTree)).trim()
}

test('transpileNode: div', assert => {
  assert.deepEqual(transpile('<div></div>'), 'tag("div")')
})

test('transpileNode: br', assert => {
  assert.deepEqual(transpile('<br/>'), 'tag("br")')
})
