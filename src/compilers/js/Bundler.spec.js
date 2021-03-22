const test = require('ava')
const Bundler = require('./Bundler')

test('it bundles js components', async assert => {
  const bundler = new Bundler({ paths: [] })
  const input = `
    import { h1 } from 'boxwood'

    export default function () {
      return h1('Hello, world!')
    }
  `
  const output = await bundler.bundle(input)
  assert.truthy(output.includes('render'))
})
