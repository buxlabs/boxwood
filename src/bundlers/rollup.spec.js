'use strict'

const test = require('ava')
const { bundle } = require('./rollup')
const { join } = require('path')

test('rollup: keeps simple code', async assert => {
  const source = 'const foo = "bar"; console.log(foo)'
  const output = await bundle(source)
  assert.truthy(output.includes(source))
})

test('rollup: can import local dependencies', async assert => {
  const source = 'import foo from "./foo"; console.log(foo())'
  const output = await bundle(source, { paths: [join(__dirname, '../../test/fixtures/bundler')] })
  assert.truthy(output.includes('function foo ()'))
})
