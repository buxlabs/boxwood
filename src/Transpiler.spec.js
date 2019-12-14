import test from 'ava'
import Transpiler from './Transpiler'

const transpile = (source) => {
  const transpiler = new Transpiler()
  return transpiler.transpile(source)
}

test('it transpiles <end> for an <if> tag', assert => {
  const source = transpile('<if foo>bar<end>')
  assert.deepEqual(source, '<if foo>bar</if>')
})

test('it transpiles </end> for an <if> tag', assert => {
  const source = transpile('<if foo>bar</end>')
  assert.deepEqual(source, '<if foo>bar</if>')
})

test('it transpiles <end> for an <if> and <else> tags', assert => {
  const source = transpile('<if foo>bar<else>baz<end>')
  assert.deepEqual(source, '<if foo>bar</if><else>baz</else>')
})

test('it transpiles <end> for an <if> and <elseif> tags', assert => {
  const source = transpile('<if foo>bar<elseif baz>qux<elseif quux>quuux<end>')
  assert.deepEqual(source, '<if foo>bar</if><elseif baz>qux</elseif><elseif quux>quuux</elseif>')
})

test('it transpiles <end> for an <if>, <elseif> and <else> tags', assert => {
  const source = transpile('<if foo>bar<elseif baz>qux<else>quux<end>')
  assert.deepEqual(source, '<if foo>bar</if><elseif baz>qux</elseif><else>quux</else>')
})

test('it transpiles <end> for an <unless> tag', assert => {
  const source = transpile('<unless foo>bar<end>')
  assert.deepEqual(source, '<unless foo>bar</unless>')
})

test('it transpiles <end> for an <unless> and <elseunless> tag', assert => {
  const source = transpile('<unless foo>bar<elseunless>baz<end>')
  assert.deepEqual(source, '<unless foo>bar</unless><elseunless>baz</elseunless>')
})

test.skip('it works correctly for nested statements', assert => {
  const source = transpile('<if foo><if bar>baz<end><end>')
  assert.deepEqual(source, '<if foo><if bar>baz</if></if>')
})

test('it does not create duplicate closing tags', assert => {
  const source = transpile('<if foo>bar</if>')
  assert.deepEqual(source, '<if foo>bar</if>')
})
