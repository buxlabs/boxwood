'use strict'

const test = require('ava')
const compile = require('../../helpers/deprecated-compile')

test('server[html]: one tag', async assert => {
  const { template } = await compile('<div></div>', { path: 'index.html' })
  assert.deepEqual(template(), '<div></div>')
})

test('server[js]: one tag', async assert => {
  const { template } = await compile(`
    import { div } from 'boxwood'

    export default function () {
      return div()
    }
  `, { path: 'index.js' })
  assert.deepEqual(template(), '<div></div>')
})
