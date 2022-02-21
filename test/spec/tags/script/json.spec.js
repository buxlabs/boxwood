const test = require('ava')
const compile = require('../../../helpers/compile')
const { escape } = require('../../../..')

test('script[type="application/json"]', async assert => {
  var { template } = await compile(`<script type="application/json">{schema}</script>`)
  assert.deepEqual(template({ schema: "{}" }, escape), '<script type="application/json">{}</script>')
})


test('script[type="application/ld+json"]', async assert => {
  var { template } = await compile(`<script type="application/ld+json">{schema}</script>`)
  assert.deepEqual(template({ schema: "{}" }, escape), '<script type="application/ld+json">{}</script>')
})
