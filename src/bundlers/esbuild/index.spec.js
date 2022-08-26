'use strict'

const test = require('ava')
const { bundle } = require('.')
const { join } = require('path')

test('esbuild: keeps simple code', async assert => {
  const source = 'const foo = "bar"; console.log(foo)'
  const output = await bundle(source)
  assert.truthy(output.includes("bar"))
})
