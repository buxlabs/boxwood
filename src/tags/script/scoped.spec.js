'use strict'

const test = require('ava')
const scoped = require('./scoped')

test('#scoped: inlines vdom code', async assert => {
  const source = `
    import { tag } from 'boxwood'
    tag('div', {}, ['Hello'])
  `
  const output = await scoped({ source, paths: [], attrs: [] })
  assert.truthy(output.includes('tag'))
})
