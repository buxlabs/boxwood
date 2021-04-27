'use strict'

const test = require('ava')
const { program, generate, ArrayExpression } = require('abstract-syntax-tree')
const { transpileNode } = require('./node')
const { parse } = require('../utilities/html')

function body (tree) {
  return tree.length === 1
    ? transpileNode({ node: tree[0], parent: tree, index: 0 })
    : new ArrayExpression(
      tree
        .map((node, index) => transpileNode({ node, parent: tree, index }))
        .filter(Boolean)
    )
}

function transpile (input) {
  const tree = parse(input)
  return generate(program(body(tree))).trim()
}

test('transpileNode: div', assert => {
  assert.deepEqual(transpile('<div></div>'), 'tag("div")')
})

test('transpileNode: multiple divs', assert => {
  assert.deepEqual(transpile('<div></div><div></div>'), '[tag("div"), tag("div")]')
})

test('transpileNode: br', assert => {
  assert.deepEqual(transpile('<br/>'), 'tag("br")')
})

test('transpileNode: if', assert => {
  assert.deepEqual(transpile('<if foo></if>').replace(/\n/g, ""), '(function () {  if (foo) {    return;  }})()')
})

test('transpileNode: for', assert => {
  assert.deepEqual(transpile('<for car in cars>{car}</for>').replace(/\n/g, ""), '(function () {  var __output__ = [];  for (var i = 0, ilen = cars.length; i < ilen; i++) {    var car = cars[i];    __output__.push(escape(car));  }  return __output__;})()')
})
