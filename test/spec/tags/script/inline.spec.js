const test = require('ava')
const compile = require('../../../helpers/deprecated-compile')
const path = require('path')
const { escape } = require('../../../..')

test('script: inline for a js file', async assert => {
  var { template } = await compile(`<script src="./foo.js" inline></script>`, { paths: [path.join(__dirname, '../../../fixtures/scripts')] })
  assert.deepEqual(template({}, escape), `<script>console.log('foo')</script>`)
})

test('script: inline for a js file that does not exist', async assert => {
  var { template } = await compile(`<script src="./foo.js" inline></script>`, { paths: [] })
  assert.deepEqual(template({}, escape), ``)
})
