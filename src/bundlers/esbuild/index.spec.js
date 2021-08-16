'use strict'

const test = require('ava')
const { bundle } = require('.')
const { join } = require('path')

test('esbuild: keeps simple code', async assert => {
  const source = 'const foo = "bar"; console.log(foo)'
  const output = await bundle(source)
  assert.truthy(output.includes("bar"))
})

test('esbuild: can import html components', async assert => {
  const source = `
    import { tag } from "boxwood"
    import nav from "components/nav.html"

    export default function () {
      return nav()
    }
  `
  const output = await bundle(source, {
    paths: [
      join(__dirname, '../../vdom/server'),
      join(__dirname, '../../../test/fixtures')
    ]
  })
  assert.truthy(output)
})
