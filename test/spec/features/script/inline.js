import test from '../../../helpers/test'
import compile from '../../../helpers/compile'
import path from 'path'

test('script: inline', async assert => {
  let template

  template = await compile(`<script inline>const foo = "bar"</script>{foo}`)
  assert.deepEqual(template({}, html => html), 'bar')

  template = await compile(`<script inline>const year = () => 2018</script>{year()}`)
  assert.deepEqual(template({}, html => html), '2018')

  template = await compile(`<script inline>const foo = ['bar', 'baz']</script><for qux in foo>{qux}</for>`)
  assert.deepEqual(template({}, html => html), 'barbaz')

  template = await compile(`<script src="./foo.js" inline></script>`, { paths: [path.join(__dirname, '../../../fixtures/scripts')] })
  assert.deepEqual(template({}, html => html), `<script>console.log('foo')\n</script>`)
})
