import test from '../../helpers/test'
import compile from '../../helpers/compile'
import escape from 'escape-html'
import { join } from 'path'

test('template: component', async assert => {
  const template = await compile('<template foo>foo</template><foo/>')
  assert.deepEqual(template({}, escape), 'foo')
})

// TODO add a possibility to declare a local component with the same
// name as the imported component
test('template: component inside of a imported component', async assert => {
  const template = await compile(`
    <import foo from='./foo.html'>
    <foo />
  `, {
    paths: [ join(__dirname, '../../fixtures/template') ]
  })
  assert.deepEqual(template({}, escape), 'bar')
})

test('template: objects as parameters', async assert => {
  const template = await compile(`
    <template foo>{bar.baz}</template>
    <foo bar="{ { baz: 'qux' } }" />
  `)
  assert.deepEqual(template({}, escape), 'qux')
})
