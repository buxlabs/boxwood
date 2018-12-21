import test from '../../helpers/test'
import compile from '../../helpers/compile'
import escape from 'escape-html'

test('style: scoped attribute', async assert => {
  const template = await compile('<style scoped>.foo{color:red}</style><div class="foo">bar</div>')
  assert.deepEqual(template({}, escape), '<style>.foo.scope-122304991{color:red}</style><div class="foo scope-122304991">bar</div>')
})
