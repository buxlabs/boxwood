'use strict'

const test = require('ava')
const Bundler = require('./Bundler')
const { join } = require('path')

test('Bundler: keeps simple code', async assert => {
  const source = 'const foo = "bar"; console.log(foo)'
  const bundler = new Bundler()
  const output = await bundler.bundle(source)
  assert.truthy(output.includes('console.log'))
})
