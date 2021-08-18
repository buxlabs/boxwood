const test = require('ava')
const compile = require('../../../helpers/deprecated-compile')
const path = require('path')
const { escape } = require('../../../..')

test('script: inline strings', async assert => {
  var { template } = await compile(`<script inline>const foo = "bar"</script>{foo}`)
  assert.deepEqual(template({}, escape), 'bar')
})

test('script: inline arrays', async assert => {
  var { template } = await compile(`<script inline>const foo = ['bar', 'baz']</script><for qux in foo>{qux}</for>`)
  assert.deepEqual(template({}, escape), 'barbaz')
})

test('script: inline functions', async assert => {
  var { template } = await compile(`<script inline>const year = () => 2018</script>{year()}`)
  assert.deepEqual(template({}, escape), '2018')
})

test('script: inline for a js file', async assert => {
  var { template } = await compile(`<script src="./foo.js" inline></script>`, { paths: [path.join(__dirname, '../../../fixtures/scripts')] })
  assert.deepEqual(template({}, escape), `<script>console.log('foo')</script>`)
})

test('script: inline for a js file that does not exist', async assert => {
  var { template } = await compile(`<script src="./foo.js" inline></script>`, { paths: [] })
  assert.deepEqual(template({}, escape), ``)
})
