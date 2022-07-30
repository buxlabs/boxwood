'use strict'

const test = require('ava')
const Transpiler = require('./Transpiler')

const transpile = (source) => {
  const transpiler = new Transpiler()
  return transpiler.transpile(source)
}

test('it does not create duplicate closing tags', assert => {
  const source = transpile('<if foo>bar</if>')
  assert.deepEqual(source, '<if foo>bar</if>')
})

test('it rewrites the shorthand syntax', assert => {
  const source = transpile('<div {foo}></div>')
  assert.deepEqual(source, '<div foo="{foo}"></div>')
})
