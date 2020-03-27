const test = require('ava')
const { join } = require('path')
const compile = require('../../../helpers/compile')
const { escape } = require('../../../..')

test('script[polyfills]: includes the polyfills', async assert => {
  const { template } = await compile(`<script polyfills="['promise.js']">new Promise(resolve => resolve());</script>`, {
    paths: [ join(__dirname, '../../../fixtures/polyfills') ]
  })
  assert.deepEqual(template({}, escape), '<script>const Promise = () => {};\nnew Promise(resolve => resolve());</script>')
})

test('script[polyfills]: returns a warning if the polyfill is not found', async assert => {
  const { template, warnings } = await compile(`<script polyfills="['proomise.js']">new Promise(resolve => resolve());</script>`, {
    paths: [ join(__dirname, '../../../fixtures/polyfills') ]
  })
  assert.deepEqual(template({}, escape), '<script>new Promise(resolve => resolve());</script>')
  assert.deepEqual(warnings.length, 2)
  assert.deepEqual(warnings[1].type, 'POLYFILL_NOT_FOUND')
  assert.deepEqual(warnings[1].message, 'proomise.js polyfill not found')
})
